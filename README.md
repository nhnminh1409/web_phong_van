# INTERVIEWING WEB
## Mô tả
`web_phong_van` là một trang web dùng để cung cấp cho người phỏng vấn một phương thức phỏng vấn online và lưu giữ kết quả phỏng vấn.
Dự án này nhằm mục đích giúp cho việc phỏng vấn dễ dàng hơn. Với người tham gia phỏng vấn có thể tham gia phỏng vấn đa quốc gia với những người không có điều kiện di chuyển đến nơi phỏng vấn trực tiếp. Với nhà tuyển dụng, trang web giúp họ tiết kiệm thời gian và nhân lực dành cho việc phỏng vấn trong quá trình tuyển dụng; bên cạnh đó, trang web cho phép nhà tuyển dụng lưu trữ kết quả phỏng vấn của ứng viên.

## Tính năng chính

- Tạo ra tokens riêng biệt cho mỗi ứng viên có trong danh sách cho sẵn.
- Ứng viên sử dụng token để xác nhận và tham gia phỏng vấn.
- Ghi hình quá trình trả lời của ứng viên cho từng câu hỏi.
- Giới hạn thời gian chuẩn bị, trả lời câu hỏi.
- Lưu trữ kết quả sau khi kết thúc với tên ứng viên và thời gian bắt đầu phỏng vấn.
- Chuyển giọng nói của ứng viên thành văn bản (Chỉ hoạt động với ngôn ngữ là Tiếng Anh).

## Công nghệ sử dụng

- Front-end:  HTML / CSS / Javascript / JSON
- Back-end: PHP / FFPRESET, whisper AI
- Excel file, đưa danh sách ứng viên. Python, tạo token.
  
## Cài đặt & Chạy dự án
### Cài đặt
```bash
   git clone https://github.com/nhnminh1409/web_phong_van.git
   cd web_phong_van
   pip install pandas
```
### Chạy dự án
1. Tạo tokens
```bash
   python generate_tokens.py hoặc py generate_tokens.py
```
hoặc nhấn đúp vào file RUN.bat 
2. Vào file tokens.json kiểm tra tokens
3. 

  
