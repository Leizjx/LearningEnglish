import React, { useState } from 'react';
import axiosInstance from '../services/axiosInstance'; // Using custom axios for tokens.

const VocabularyBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vocabularies, setVocabularies] = useState([{ word: '', meaning: '' }, { word: '', meaning: '' }]);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleAddRow = () => setVocabularies([...vocabularies, { word: '', meaning: '' }]);
  const handleRemoveRow = (index) => setVocabularies(vocabularies.filter((_, i) => i !== index));
  const handleChange = (index, field, value) => {
    const newV = [...vocabularies];
    newV[index][field] = value;
    setVocabularies(newV);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validVocabs = vocabularies.filter(v => v.word.trim() !== '' && v.meaning.trim() !== '');
    if (validVocabs.length < 2) {
      window.alert('Vui lòng nhập ít nhất 2 từ vựng!');
      return;
    }

    try {
      setStatus({ type: 'info', msg: 'Đang tạo bài thi...' });
      const res = await axiosInstance.post('/quizzes/custom', { title, description, vocabularies: validVocabs });
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Tạo bài thi thành công! Danh sách sẽ được tải lại.' });
        setTitle('');
        setDescription('');
        setVocabularies([{ word: '', meaning: '' }, { word: '', meaning: '' }]);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch(err) {
      setStatus({ type: 'error', msg: 'Lỗi khi tạo quiz: ' + (err.response?.data?.message || err.message) });
    }
  };

  if (!isOpen) return (
     <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button onClick={() => setIsOpen(true)} style={{ background: '#27ae60', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          ➕ Tự tạo Quiz Bằng Từ Vựng Của Bạn
        </button>
      </div>
  );

  return (
    <div style={{ padding: '25px', background: '#fff', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', border: '1px solid #e1e8ed' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>🛠 Trình Tạo Quiz Cá Nhân</h2>
        <button onClick={() => setIsOpen(false)} style={{ padding: '8px 16px', background: '#f1f2f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#747d8c' }}>Đóng lại</button>
      </div>
      
      {status.msg && <div style={{ padding: '12px', background: status.type === 'error' ? '#ffeaa7' : (status.type === 'info' ? '#e3f2fd' : '#55efc4'), color: '#2d3436', marginBottom: '20px', borderRadius: '6px', fontWeight: '500' }}>{status.msg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <input required placeholder="Tên bài thi (VD: Từ vựng Unit 1)" value={title} onChange={e=>setTitle(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius:'6px', border:'1px solid #ddd', fontSize: '1.1rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
           <input placeholder="Mô tả bài thi (tùy chọn)" value={description} onChange={e=>setDescription(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius:'6px', border:'1px solid #ddd' }} />
        </div>

        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#2d3436' }}>Nhập danh sách từ vựng cho bài thi này:</h4>
          {vocabularies.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#636e72', display: 'flex', alignItems: 'center', width: '30px' }}>{i + 1}.</span>
              <input required placeholder="Từ tiếng Anh" value={v.word} onChange={e=>handleChange(i, 'word', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius:'6px', border:'1px solid #ccc' }} />
              <input required placeholder="Nghĩa tiếng Việt" value={v.meaning} onChange={e=>handleChange(i, 'meaning', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius:'6px', border:'1px solid #ccc' }} />
              {vocabularies.length > 2 && <button type="button" onClick={()=>handleRemoveRow(i)} style={{ padding: '10px 15px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>}
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button type="button" onClick={handleAddRow} style={{ padding: '12px 20px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm dòng từ vựng</button>
            <button type="submit" style={{ padding: '12px 20px', background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>💾 Lưu và Tạo Quiz Thành Công</button>
          </div>
        </div>
      </form>
    </div>
  );
}
export default VocabularyBuilder;
