import { useState } from 'react';
import { addReview } from '../services/api';

function ReviewForm({ restaurantId, onReviewAdded }) {
  const [formData, setFormData] = useState({
    userName: '',
    rating: 5,
    comment: '',
    visitDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ✅ ตรวจสอบความถูกต้องของข้อมูลก่อนส่ง
  const validateForm = () => {
    const newErrors = {};

    // ตรวจชื่อผู้ใช้ (2-50 ตัวอักษร)
    if (!formData.userName.trim()) {
      newErrors.userName = 'กรุณากรอกชื่อ';
    } else if (formData.userName.trim().length < 2) {
      newErrors.userName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    } else if (formData.userName.trim().length > 50) {
      newErrors.userName = 'ชื่อต้องไม่เกิน 50 ตัวอักษร';
    }

    // ตรวจคะแนน (1–5)
    const ratingNum = parseInt(formData.rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      newErrors.rating = 'คะแนนต้องอยู่ระหว่าง 1–5';
    }

    // ตรวจความคิดเห็น (10–500 ตัวอักษร)
    if (!formData.comment.trim()) {
      newErrors.comment = 'กรุณากรอกความคิดเห็น';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร';
    } else if (formData.comment.trim().length > 500) {
      newErrors.comment = 'ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // ✅ เรียก API เพื่อเพิ่มรีวิว
      const result = await addReview({
        restaurantId,
        ...formData,
        rating: parseInt(formData.rating)
      });

      // ✅ ถ้าเพิ่มสำเร็จ
      if (result && result.success) {
        alert('เพิ่มรีวิวสำเร็จ! ขอบคุณสำหรับความคิดเห็น 😊');

        // reset ฟอร์ม
        setFormData({
          userName: '',
          rating: 5,
          comment: '',
          visitDate: new Date().toISOString().split('T')[0]
        });
        setErrors({});

        // เรียก callback เพื่ออัพเดตรีวิวในหน้าหลัก
        if (onReviewAdded) onReviewAdded();
      } else {
        alert('ไม่สามารถเพิ่มรีวิวได้ กรุณาลองใหม่อีกครั้ง');
      }

    } catch (error) {
      console.error('Error adding review:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form">
      <h3>เขียนรีวิว</h3>
      <form onSubmit={handleSubmit}>
        {/* ====== ชื่อ ====== */}
        <div className="form-group">
          <label>ชื่อของคุณ *</label>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="กรอกชื่อ-นามสกุล"
            className={errors.userName ? 'invalid' : ''}
          />
          {errors.userName && <span className="error">{errors.userName}</span>}
        </div>

        {/* ====== คะแนน ====== */}
        <div className="form-group">
          <label>คะแนน *</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            className={errors.rating ? 'invalid' : ''}
          >
            <option value="5">⭐⭐⭐⭐⭐ ดีเยี่ยม</option>
            <option value="4">⭐⭐⭐⭐ ดีมาก</option>
            <option value="3">⭐⭐⭐ ดี</option>
            <option value="2">⭐⭐ พอใช้</option>
            <option value="1">⭐ ต้องปรับปรุง</option>
          </select>
          {errors.rating && <span className="error">{errors.rating}</span>}
        </div>

        {/* ====== ความคิดเห็น ====== */}
        <div className="form-group">
          <label>ความคิดเห็น *</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="เล่าประสบการณ์การทานอาหารที่ร้านนี้... (อย่างน้อย 10 ตัวอักษร)"
            rows="4"
            className={errors.comment ? 'invalid' : ''}
          />
          <div className="char-count">
            {formData.comment.length}/500 ตัวอักษร
          </div>
          {errors.comment && <span className="error">{errors.comment}</span>}
        </div>

        {/* ====== วันที่เข้าร้าน ====== */}
        <div className="form-group">
          <label>วันที่เข้าร้าน</label>
          <input
            type="date"
            value={formData.visitDate}
            onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
