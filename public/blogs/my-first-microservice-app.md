Trong bài này thì mình sẽ xem lại về một ứng dụng mà mình mới build xong theo kiến trúc microservice. Đây là ứng dụng đầu tiên mà mình xây dựng theo kiến trúc này, và sẽ là tiền đề để mình có thể xây dựng các ứng dụng microservice tiếp theo.

Ứng dụng này là ứng dụng quản lý task đơn giản, gồm một vài thông số cho task. Trong ứng dụng này thì mình sử dụng một số công nghệ như:

- **ReactJS** để xây dựng giao diện người dùng.
- **Nginx** để làm proxy server và triển khai ứng dụng web.
- **NodeJS** để xây dựng các service.
- **MongoDB** để lưu trữ task.
- **MySQL** để lưu trữ thông tin người dùng.
- **Docker** để container hoá các tiến trình. Vì mục tiêu của mình là triển khai ứng dụng lên hạ tầng được quản lý bởi Kubernetes.

![0_xn0mb9](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289432/portfolio/blogs/my-first-microservice-app/0_xn0mb9.png)

## Table of Contents

Trong bài này thì mình sẽ nói về một số nội dung như sau:

- Kiến trúc tổng quan và tại sao lại sử dụng kiến trúc microservice?
- Nói về Identity service
- Nói về Task service
- Nói về Services Interaction
- Nginx & ReactJS

## Overview of Architecture

Ở những project trước thì mình viết ứng dụng backend theo dạng **Monolith Architecture** (Kiến trúc nguyên khối), nghĩa là mọi logic đều nằm trong một server duy nhất. Vậy thì tại sao mình lại chuyển sang mô hình **microservice**?

Dưới đây là kiến trúc tổng quan của hệ thống:

![1.1_am0vff](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289434/portfolio/blogs/my-first-microservice-app/1.1_am0vff.png)

Đầu tiên, để giải thích được vì sao mình lại chuyển qua kiến trúc **microservice**, là do vấn đề của kiến trúc **monolith**, theo từng ý như sau:

- Khi mọi services đều được chạy tại một server duy nhất, thì sẽ có khả năng khi server down, thì mọi service đều down.
- Có thể làm giảm hiệu năng của các services quan trọng.
- Khó để sửa lỗi và bảo trì hơn, khó để triển khai hơn, vì khi có lỗi, thì mình sẽ cần phải tìm toàn bộ codebase cũng như là logs của server. Khó triển khai hơn là vì với services này, những thư viện sẽ không hỗ trợ nữa, hoặc không tương thích với các thư viện khác, … Khi đó sẽ làm chậm quá trình triển khai của mình.
- Khó mở rộng hơn và tốn chi phí để mở rộng hơn, vì khi lưu lượng người dùng lớn, mình sẽ buộc phải mở thêm một máy nữa để chạy toàn bộ server của mình, nhưng mình sẽ cần phải có được máy có cùng cấu hình hình với máy host server hiện tại ⇒ tăng đôi chi phí.
- Khó khăn hơn trong việc phát triển, trong một dự án thì có nhiều team cùng phát triển một dự án, có nghĩa là họ thao tác với project trong cùng một codebase, khả năng conflict commit và rốt code sẽ nhiều hơn.

Với kiến trúc microservice thì nó khắc phục được những vấn đề trên như sau:

- Các services sẽ không còn được chạy trong một server nhất nữa, mà sẽ chạy ở trong nhiều server khác nhau (có thể cùng host hoặc khác host). Khi đó thì mình có thể tập trung được vào một service duy nhất, kể cả khi triển khai.
- Khi các service chạy trong cùng một server, thì có nghĩa là tất cả đang dùng chung tài nguyên CPU, khi đó sẽ có những task nặng chiếm nhiều CPU, RAM hơn ⇒ làm các service khác chậm đi, hoặc là chỉ có một số service là hoặc động hoặc hoạt động đúng công suất ⇒ dư thừa tài nguyên không đáng có. Nhưng khi tách biệt ra từng processs, server riêng thì việc mà các services sử dụng tài nguyên CPU, RAM cũng sẽ tách biệt nhau ⇒ mình có thể dễ dàng quan sát các thông số hơn ⇒ điều chỉnh lại cấu hính của host, máy ảo hoặc của container.
- Khi các services được tách biệt, thì một serrvice sẽ hoàn toàn được một team đảm nhận trách nhiệm phát triển, bảo trì nó. Khi có lỗi thì sẽ được chính team đó giải quyết mà không làm hệ thống có thời gian downtime, các dịch vụ khác vẫn hoạt động bình thường.
- Dễ mở rộng hơn và dễ bảo trì hơn, vì lúc này mỗi service sẽ được chạy riêng trong từng host, vm hay conntainer khác nhau, nên khi một service đang trong thời điểm traffic lớn, thì mình chỉ cần scale host, vm hay container đang chạy service đó lên là được. Với monolith, thì mình cần phải tìm được một host có cùng cấu hình tối thiểu để chạy hệ thống, nhưng với microservice thì mình chỉ cần tìm đủ tài nguyên cho duy nhất một hoặc những services cần scale ⇒ tiết kiệm chi phí, dùng được hết tài nguyên của host. Với microservice thì mỗi service sẽ có thể được phát triển bởi các công nghệ khác nhau, nên sẽ không cần phải lo lắng vì các thư viện của service này sẽ xung đột với các thư viện của service khác.
- Dễ dàng hơn trong việc phát triển, cho dù toàn bộ team có làm việc trong cùng một codebase hay không. Vì với mỗi service đã được phân định rõ ràng và tách biệt, nên codebase của mỗi service sẽ khác nhau ⇒ văn hóa của một team nhỏ sẽ được đề cao, có thể dùng nhiều công nghệ khác nhau hơn, tốt ưu cho từng usecase, bài toán của từng dịch vụ hơn.
- Trong phần tiếp theo thì mình sẽ đi sâu hơn vào các dịch vụ, vai trò của nó trong hệ thống là gì và mình sẽ có một ví dụ về cách các dịch vụ được sử dụng.

## Identity Service

![2.1_znyozi](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289434/portfolio/blogs/my-first-microservice-app/2.1_znyozi.png)

Vai trò của dịch vụ này đơn giản sẽ là xác thực và ủy quyền cho người dùng. Bằng cách kiểm tra trong cơ sở dữ liệu để có thể kiểm tra xem người dùng gửi request đăng nhập tới có phải là người dùng hợp lệ của ứng dụng hay không? Khi kiểm tra xong thì dịch vụ này có thể cung cấp cho người dùng đó một token, được xem như là giấy ủy quyền cho người đùng đó thực hiện các thao tác với các dịch vụ khác ở trong hệ thống.

Service này cũng cho phép đăng ký tài khoản mới và lưu lại thông tin của người đùng ở trong database. Khi người dùng mới đăng ký xong thì service này cho phép họ có thể thao tác với các services khác luôn bằng cách là cũng cấp cho người dùng mới này một service mới.

Identity Service sẽ kết nối tới Identity Database để có thể đọc và ghi dữ liệu người đùng. Service này sẽ xác thực người dùng đươn giản như sau:

![2.2_taryxw](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289433/portfolio/blogs/my-first-microservice-app/2.2_taryxw.png)

Bên cạnh đó cũng sẽ ủy quyền cho người dùng bằng cách cung cấp token như sau:

![2.3_wfqhfi](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289433/portfolio/blogs/my-first-microservice-app/2.3_wfqhfi.png)

Payload của token bao gồm các thông tin như:

- **iss - Issuer**: cho biết đơn vị cung cấp token. Các service khác sẽ được assign một số Issuer, trong đó có Identity Service. Các services khác sẽ dựa vào trường dữ liệu này để kiểm tra xem đây có phải là token hợp lệ hay không? Có được cung cấp bởi một bên uy tín hay không?
- **exp - Expiration**: cho biết thời gian ủy quyền đã hết hay chưa? Hay token này đã hết hạn hay chưa?
- **role**: cho biết vai trò của người giữ token này trong hệ thống. Các service sẽ dùng trường này để xác định xem là user này có đủ quyền thực hiện một action nào đó lên một resource nào đó hay không.

## Task Service

![3.1_pcdork](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289434/portfolio/blogs/my-first-microservice-app/3.1_pcdork.png)

Vai trò của dịch vụ này cho phép người dùng có thể tạo task, thay đổi trạng thái của task ⇒ thao tác các tác vụ của người dùng. Đơn giản chỉ có thế, nhưng trong mỗi **endpoints** đều sẽ có các **middlewares** dùng để check xem là người dùng này có thể dùng được dịch vụ này hay không? Hay cụ thể hơn là có thể thêm / xóa / sửa task hay không?

**Task Service** có thể tương tác được với **Identity Database**, nhưng chỉ có thể đọc được dữ liệu ở trong đó, không có quyền ghi và sửa đổi. Còn lại thì **Task Service** có toàn quyền với **Task Database**.

Trong phần tiếp theo, mình sẽ giải thích sâu hơn về cách mà 2 services Task và Identity "tương tác" với nhau.

## Services Interaction

Tuy 2 services không tương tác trực tiếp với nhau, nhưng giữa 2 services này có mối liên hệ với nhau, cụ thể là **Identity Service** xác thực và ủy quyền, **Task Servic**e kiểm tra token được tạo từ **Identity Service** để quyết định xem là user này có quyền được thao tác hay không?

Mình sẽ ví dụ với Create Task Request

![4.1_btizhz](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289434/portfolio/blogs/my-first-microservice-app/4.1_btizhz.png)

Từng bước như sau:

1. Người dùng sẽ đăng nhập và Identity Service sẽ gửi token về lại cho người dùng (nếu đăng nhập thành công).
2. Người dùng sẽ điền các thông tin của task, sau đó là tạo Create Task request tới Task Service, có token ở bên trong.
3. Task Service bước đầu sẽ kiểm tra xem là token này có hợp lệ hay không? Nếu có thì qua bước kế tiếp. Token là hợp lệ nếu như:

   - Được cấp bởi một Issuer uy tín.
   - Còn hạn.
   - Là một JWT Token uy tín (vì Identity Service và Task Service đều dùng chung một Signature).

4. Tiếp theo sẽ kiểm tra xem người dùng có đủ quyền để thao tác resource này hay không? Nếu có thì đi tiếp, còn nếu không thì trả lỗi 5. 5. Unauthorization. Đây là một bước kiểm tra phức tạp.
5. Chuẩn bị các thông tin cho task để bắt đầu lưu lại trong cơ sở dữ liệu.
6. Ghi lại vào trong cơ sở dữ liệu.

Bên trong Task Service còn có một Helper gọi là Policy Checker, dùng để kiểm qua quyền của user tới một tài nguyên nào đó. Module này mình lấy ý tưởng từ IAM Policy của AWS.

Với mỗi endpoint thì mình cần phải xác định được:

- Tài nguyên (resource) mà endpoint này cho phép người dùng có thể thao tác.
- Hành động (action) mà người dùng có thể thao tác lên tài nguyên đó.

Ví dụ như một đoạn code dưới đây

```js
tasksEndpoints
  .createHandler("")
  .use(AuthMiddlewares.checkToken)
  .use(AuthMiddlewares.createPolicyChecker("task:*", "task:getTasks"));
```

**Policy Checker** sẽ hoạt động theo kiểu:

1. Một policy của một role nào đó đã được tạo ra trước đó. Policy sẽ cho biết là các roles có thể thực hiện những hành động nào lên một tài nguyên nào đó.
2. Khi có một request tới, role sẽ được tách ra từ payload của token.
3. **Policy checker** sẽ lặp các điều kiện ở trong policy của role đó để tìm xem là "Action trên endpoint này có được cho phép hay không?", nếu như "không" thì trả về lỗi 403 ⇒ Nghĩa là tài nguyên hoặc hành động mà endpoint đó quy ước không nằm trong policy của role đó hoặc là không khớp với policy của role đó.
4. Khi pass được policy, thì bắt đầu thực hiện hành động đó.

Xem chi tiết hơn tại

- Kiểm thử module: [New authentication & authorization stategy · Code4life-Labs · Discussion #11](https://github.com/orgs/Code4life-Labs/discussions/11)
- Source: [task-manager-app/task-service/src/services/auth/policyChecker.ts at main · Code4life-Labs/task-manager-app](https://github.com/Code4life-Labs/task-manager-app/blob/main/task-service/src/services/auth/policyChecker.ts)

## Nginx & ReactJS

![5.1_nffp1b](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737289434/portfolio/blogs/my-first-microservice-app/5.1_nffp1b.png)

Vai trò của **Nginx** là proxy, ẩn Task và Identity Service đang nằm ở bên dưới hệ thống. Đồng thời cũng sẽ thực hiện việc gửi ứng dụng web về cho người dùng. **Nginx** sẽ là thành phần nằm ở phần public của hệ thống, cho phép tiếp nhận các requests từ client và chuyển tiếp các requests đó về cho các Services tương ứng.

Khi đó Task và Identity Service sẽ không còn cần thiết nằm ở vùng public nữa, mà sẽ được đưa vào trong phần private của hệ thống, tăng tính bảo mật hơn.

Cụ thể là:

- Khi browser requests về route / thì **Nginx** sẽ lấy các file HTML, CSS, JS của website và trả về cho người dùng.
- Khi browser requests về route /identity thì **Nginx** sẽ chuyển tiếp yêu cầu về cho Identity Service.
- Khi browser requests về route /tasks hoặc /task thì **Nginx** sẽ chuyển tiếp yêu cầu về cho Task Service.

Có thể thấy, dưới giao diện người dùng sẽ không thật sự giao tiếp trực tiếp với các Services mà sẽ giao tiếp thông qua **Nginx**. Hy vọng thông qua bài này thì bạn sẽ hiểu về microservice cũng như là ý tưởng xây đựng ứng dụng đầu tiên theo mô hình microservice của mình!!!
