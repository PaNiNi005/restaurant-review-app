const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// ========================================
// ✅ GET /api/stats - ดึงสถิติทั้งหมด
// ========================================
app.get('/api/stats', async (req, res) => {
  try {
    // อ่านข้อมูลจากไฟล์
    const restaurants = await readJsonFile('./data/restaurants.json');
    const reviews = await readJsonFile('./data/reviews.json');

    // 1. จำนวนร้านทั้งหมด
    const totalRestaurants = restaurants.length;

    // 2. จำนวนรีวิวทั้งหมด
    const totalReviews = reviews.length;

    // 3. คำนวณคะแนนเฉลี่ยรวมทั้งหมด
    const averageRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;

    // 4. หา top 5 ร้านที่มี rating เฉลี่ยสูงสุด
    const restaurantRatings = restaurants.map((restaurant) => {
      const restaurantReviews = reviews.filter(
        (review) => review.restaurantId === restaurant.id
      );

      const avg =
        restaurantReviews.length > 0
          ? restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / restaurantReviews.length
          : 0;

      return { ...restaurant, averageRating: Number(avg.toFixed(1)) };
    });

    const topRatedRestaurants = restaurantRatings
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    // ส่งข้อมูลกลับ
    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating: Number(averageRating),
        topRatedRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
