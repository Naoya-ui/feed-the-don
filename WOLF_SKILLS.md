# The Wandering Wolf — quy tắc của bản web

Thông số riêng của prototype theo thiết kế người dùng, không phải dữ liệu boss chính thức từ Wiki.

- HP 1200; ngưỡng Stagger 840 / 480 / 180; Stagger kéo dài phần còn lại của lượt hiện tại và lượt sau.
- Level 35; Offense 38; Defense 35; Speed 4–7.
- Kháng vật lý: Slash ×0.5, Pierce ×1, Blunt ×2.
- Kháng Sin: Wrath ×1, Lust ×1, Sloth ×0.5, Gluttony ×1, Gloom ×0.5, Pride ×2, Envy ×2.
- SP bắt đầu +10, giới hạn −45…+45. Thắng/thua một Clash hoàn chỉnh: +10/−10 SP; không cộng riêng từng vòng Coin.

| Skill | Sin / Type | Base | Coin | Coin Power | Hiệu ứng |
|---|---|---:|---:|---:|---|
| Sever | Wrath / Slash | 4 | 1 | +5 | Đòn thường |
| Indigo Blade | Gloom / Slash | 4 | 2 | +4 | Mỗi hit gây 1 Exhaust |
| Azure Rend | Pride / Slash | 5 | 3 | +3 | Nhắm ô chậm nhất; thắng Clash hồi thêm 10 SP |
| Shimmering Cleave | Envy / Slash Counter | 4 | 1 | +6 | Bonus = floor((1 − HP/MaxHP) × 5), tối đa +4 khi còn sống |
| Mirage Slash | Gloom / Pierce | 5 | 2 | +2 | Weight 3; mỗi hit gây 2 Exhaust; thua Clash nhận 1 Fragile lượt sau |

## Các quy ước triển khai cần biết

- Exhaust tối đa 5, giảm 1 cuối lượt. Mỗi stack còn lại giảm 1 Max Speed; Max Speed không thấp hơn Min Speed.
- Khi Exhaust đạt ít nhất 3, ghi nhận kích hoạt cho lượt sau. Turn Start tiêu thụ tối đa 3 stack còn lại và áp dụng Offense Level Down 3 trong một lượt. Việc ghi nhận trước khi giảm cuối lượt bảo đảm trường hợp đúng 3 stack vẫn kích hoạt.
- Lone Predator tăng 1 Clash Power khi không còn đồng minh sống.
- Panic kích hoạt ở SP = −45 (điều kiện < −45 không thể xảy ra vì có clamp). Lượt sau giảm Base Power 2 và khóa Mirage; cuối lượt Panic hồi SP về 0.
- Turn 1–2: Sever, Sever, Indigo Blade. Turn 3: Azure Rend, Azure Rend, Shimmering Cleave. Chu kỳ lặp lại. Số Azure/Counter ở Turn 3 là lựa chọn triển khai cho phần phác thảo chưa chốt số lượng.
- Mirage chỉ được chọn khi HP < 480, không Panic, không Stagger. Thay ô đầu tiên ở lượt hợp lệ đầu tiên; sau lần dùng đầu, có thể xuất hiện ở lượt 3 của mỗi chu kỳ nếu vẫn dưới 40% HP. Tạo lại UI không tiêu thụ lần Mirage bắt buộc.
- Mirage chọn tối đa 3 ô khác nhau. Game hiện chỉ có Don nên ba ô cùng thuộc Don vẫn chỉ gây một hit lên Don cho mỗi Coin. Khả năng chọn nhiều Sinner cần hệ thống đội hình riêng.
- Counter không Clash và không tự đánh theo Speed. Sau một đòn trực tiếp, Wolf phản công một lần nếu còn khả năng hành động. Nếu đòn đó khiến Wolf Stagger hoặc hết HP, Counter không gây sát thương.
- Coin của Wolf cộng dồn Power trong chuỗi tấn công. Kháng vật lý và Sin nhân với nhau; Fragile tăng sát thương nhận 10% mỗi stack; Stagger ×2.
- Giới hạn an toàn 99 vòng Clash: nếu cả hai vẫn còn Coin, hai hành động kết thúc hòa, không tự trao chiến thắng.

Các thông số chi tiết bổ sung (Shimmering/Mirage, Exhaust cap, Level và các Sin còn lại) tiếp nối đặc tả Wolf trước đó. Hình ảnh và âm thanh của dự án được giữ để dùng với bộ kỹ năng mới.
