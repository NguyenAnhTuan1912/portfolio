Trong ví dụ này thì mình sẽ demo một ứng dụng lấy dữ liệu từ S3 mà không cho phép các truy cập từ bên ngoài internet. Đây có thể là bài bắt đầu cho chuỗi series về S3 cũng như là các dịch vụ liên quan, mình sẽ cố gắng tìm ra vấn đề và giải quyết nó. Cho nên có thể ví dụ này trong tương lai có thể thay thế bằng một ví dụ khác có giải pháp tốt hơn, nhưng trước mắt là như vậy đã.

## Table of contents

Trong bài này thì mình sẽ chia thành từng nội dung như sau:

1. **Problem** - nêu ra vấn đề
2. **Solution** - giải thích ví dụ và giải pháp
3. **Practice** - thực hành thiếp lập giải pháp trên AWS
4. **Pricing** - chi phí của solution

## Problem

Mình có một vấn đề như sau, giả sử mình có một ứng dụng, và có thể _cho phép người dùng upload và lấy được những dữ liệu_ đó về và _những dữ liệu này đều buộc phải riêng tư_. Cho nên dữ liệu trong storage là không thể được chia sẻ bởi các người dùng khác và càng không thể để **Public Access** cho **S3**, đồng thời phải thiết lập **Bucket Policy** để bảo vệ dữ liệu.

![2.1_gmpsob](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276820/portfolio/blogs/s3-examples-get-object-from-s3-securely/2.1_gmpsob.png)

Và nếu như mình private S3, block public access và tạo bucket policy thì người dùng không thể lấy được dữ liệu của mình ở trong đó, hoặc cũng không thể tải dữ liệu của họ lên S3.

## Solution

Để giải quyết được vấn đề này thì mình sẽ cần phải có một **Principal**, một thành phần chịu trách nhiệm cho việc lấy dữ liệu và phải nằm ở trên Cloud và nó chính là **EC2**. Để có thể lấy được dữ liệu thì mình sẽ phải

1. Tạo một identity với policy bằng **IAM Role** và gán Role đó cho **EC2**, để cho **AWS** biết được là **EC2** đó có quyền truy cập vào trong **S3 Bucket** để lấy dữ liệu.
2. Đồng thời cũng phải "nói" cho **S3 Bucket** biết là **Role** này có thể truy cập được vào bên trong nó để lấy dữ liệu.

![3.1_zneupr](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276820/portfolio/blogs/s3-examples-get-object-from-s3-securely/3.1_zneupr.png)

Nhưng vẫn chưa đủ, **EC2** là một máy server nằm trong một **VPC**, còn **S3** là một _service nằm bên ngoài VPC_, nên để mà **EC2** có thể gửi được yêu cầu tới **S3** thì trong **VPC** chứa **EC2** buộc phải tạo thêm **S3 Endpoint**, để có thể liên kết 2 dịch vụ này với nhau.

![3.2_j0wc6g](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276820/portfolio/blogs/s3-examples-get-object-from-s3-securely/3.2_j0wc6g.png)

Khi thiết lập xong, **EC2** có thể "đại diện" cho user để lấy được dữ liệu từ **S3** Bucket.

## Practice

Giờ thì chúng ta đi vào phần thực hành thôi!

### Setup Infrastructure

Tìm dịch vụ **VPC** trên thanh tìm kiếm, khi vào trong **VPC Console**, chọn Your **VPCs**.

![4.1.1_t7gfcl](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276822/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.1.1_t7gfcl.png)

Setup VPC sao cho:

- Có 1 AZ.
- Có 1 Public Subnet.
- Có 1 S3 Gateway.

Kết quả sẽ giống như thế này

![4.1.2_q4ylet](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276822/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.1.2_q4ylet.png)

### Setup IAM Role for EC2

Trên thanh tìm kiếm, tìm **IAM**. Khi vào trong **IAM Console** thì chọn **Policies** ở thanh menu bên trái. Trước khi tạo role thì mình sẽ cấp một số policy nhất định cho role này. Chọn **Create policy**. Vì thao tác với **S3**, cho nên mình sẽ chọn dịch vụ là **S3** và lấy quyền truy cập vào trong đó.

Hiện tại mình chỉ cần `s3:GetObject` và **resources** chọn **All**. Sau đó là đặt tên (gợi ý: **S3ExamplesPolicy**) và tạo policy.

![4.2.1_gyuvv1](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276824/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.2.1_gyuvv1.png)

Ở các ví dụ sau thì mình sẽ cấp thêm các action phù hợp vói các ví dụ đó. Tiếp theo là mình sẽ tạo Role cho EC2, nên là sẽ chọn đúng **trusted entity type** và **use case**.

![4.2.2_dnpzqp](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276825/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.2.2_dnpzqp.png)

Tìm lại poilcy đã tạo ỏ bước trước đó, chọn policy đó và ấn **Next**. Đặt một cái tên có nghĩa như **S3ExamplesRole**, sau đó là tạo role.

![4.2.3_mdbvzx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276828/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.2.3_mdbvzx.png)

![4.2.4_ilbcqu](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276828/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.2.4_ilbcqu.png)

### Launch EC2 Instance

Giờ mình sẽ tạo một máy chủ để thực hiện việc lấy file và gửi về lại cho người dùng và máy chủ này sẽ dùng role trước đó để có quyền truy suất vào trong S3.

Tìm **EC2** trên thanh tìm kiếm, trong EC2 Console, chọn **Instances** ở menu bên trái, ấn tiếp **Launch instance**. Và chúng ta sẽ tạo một máy chủ có các yêu cầu sau:

- **Name**: chọn một cái tên dễ nhớ (gợi ý: **s3-examples-server**).
- **Application and OS Images (Amazon Machine Image)**: chọn Ubuntu (Ubuntu Server 24.04 trong Free tier). Các lựa chọn khác thì để nguyên si.
- **Instance type**: chọn **t2.micro**.
- **Key pair**: nên tạo một cái nếu chưa có.
- **Network settings**: chọn VPC mà chúng ta đã tạo trước đó, và đặt nó trong public subnet. Nhớ chọn **Enable cho Auto-assign public IP**.
- **Firewall (security group)**: chúng ta sẽ tạo cái mới.
  - **Name**: tên dễ nhớ (gợi ý: s3-examples-sg).
  - **Inbound rule**: 2 cái, cho **Custom TCP** port **5000** với mọi **IPv4** và cho **SSH** chỉ với **địa chỉ IP của mình**.

![4.3.1_axq9lt](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276829/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.3.1_axq9lt.png)

![4.3.2_fapc82](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276831/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.3.2_fapc82.png)

Tiến hành gán Role mới tạo cho máy EC2

- Chọn **EC2 Instance** mới tạo xong.
- Xổ **Actions**.
- Chọn **Security**.
- Chọn **Modify IAM Role**, mình sẽ chọn role đã tạo trước đó.

![4.3.3_hcq6hr](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276832/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.3.3_hcq6hr.png)

![4.3.4_tuoos9](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276834/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.3.4_tuoos9.png)

Xem thêm chi tiết trong [Code4Life | Launch EC2 Instances](https://deploy-on-cloud-workshop.vercel.app/preparation/launch-ec2-instances)

### Setup NodeJS Server to access S3 Bucket

Sau khi tạo và gán role cho EC2 Instance xong, thì việc tiếp theo mà mình sẽ phải làm là thiết lập server ở bên trong Host. Kết nối SSH vào trong EC2 Instance với public key ở trong máy và VsCode.

Để có thể kết nối SSH được tới EC2, thì mình cần phải:

- Có extensions để quản lý việc kết nối và quản lý thông tin của Host.
- Đường dẫn tới key.
- Địa chỉ Public IPv4 của EC2.

Xem thêm chi tiết trong [Code4Life | Connect SSH to EC2](https://deploy-on-cloud-workshop.vercel.app/preparation/connect-ssh-to-ec2)

Thông tin của Host trong `.ssh/config`

![4.4.1_kevsnf](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276835/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.1_kevsnf.png)

Khi kết nối lần đầu, mình sẽ mở được Shell Session vói Host đó, và trong phần này mình sẽ mở luôn **/home/ubuntu** (người dùng mặc định của Ubuntu Server Image).

![4.4.2_ojwpjs](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276839/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.2_ojwpjs.png)

Nếu bạn tới được đây thì chúc mừng đã kết nối thành công, giờ thì chúng ta sẽ tiến hành clone source của project.

```bash
git clone https://github.com/Code4life-Labs/s3-examples.git
```

![4.4.3_lwt4b9](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276840/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.3_lwt4b9.png)

Tiếp theo chúng ta sẽ phải chạy 2 scripts để setup môi trường và server:

`s3-examples/setup/install-nodejs.sh`

```bash
bash s3-examples/setup/install-nodejs.sh
```

![4.4.4_cvruwx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276840/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.4_cvruwx.png)

![4.4.5_i5yqcz](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276842/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.5_i5yqcz.png)

Trước khi cài các dependencies và chạy server, thì chúng ta cần sẽ phải cài đặt biến môi trường (thay `YOUR_BUCKET_NAME` thành tên bucket của bạn).

```bash
echo "BUCKET_NAME=YOUR_BUCKET_NAME" >> s3-examples/.env
echo "AWS_REGION=ap-southeast-1" >> s3-examples/.env
```

![4.4.6_xw0zwd](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276845/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.6_xw0zwd.png)

Tiếp theo là `s3-examples/setup/setup.sh`

```bash
bash s3-examples/setup/setup.sh
```

![4.4.7_qfxdoy](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276847/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.4.7_qfxdoy.png)

Ok, như vậy là server đã sẵn sàng để lấy dữ liệu, bước sau chúng ta sẽ thực hiện việc tạo Bucket và tải fìle lên bucket để kiểm chứng là xong.

### Create S3 Bucket & Setup policy

Trên thanh tìm kiếm, tìm **S3**. Trong **S3 Console**, ấn **Create bucket** để tạo bucket trong Region Singapore (**ap-southeast-1**) với một số thông tin sau:

- **Name**: đặt tên đúng với tên biến môi trường mà bạn đã thêm để chạy server trước đó.
- Chọn **ACLs disabled (recomended)**.
- Tích chọn **Block all public access**.
- Bucket versioning: **Disable**.
- Bucket Key: chọn **Disable**.

![4.5.1_bkjawn](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276848/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.5.1_bkjawn.png)

Vào trong bucket để tải một file gì đó lên, có thể file âm thanh, video, ảnh để cho dễ test. Ở đây mình sẽ tải một lên một file âm thanh. Nhớ chú ý tên của file, mình sẽ dùng nó để test.

![4.5.2_j45qfx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276850/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.5.2_j45qfx.png)

Bước cuối cùng, là chúng ta sẽ phải cài **Bucket Policy** để **EC2** có thể truy xuất vào được trong **Bucket** này. Chuyển qua tab **Permissions**, kéo xuống phần **Bucket policy** và chọn **Edit**.

Trong trang chi tiết của **S3ExamplesRole** mà chúng ta đã tạo trước đó, sao chép lại ARN để dùng làm **Principal** trong Bucket policy.

![4.5.3_rgdyow](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276851/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.5.3_rgdyow.png)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/S3ExamplesRole"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Nhớ đổi lại **YOUR_ACCOUNT_ID** và **YOUR_BUCKET_NAME**. Giờ thì đã sẵn sàng để test!!!

### Test result

Server sẽ export ra 1 endpoint **http://<ec2-public-ipv4>:5000/files/<name_of_file>**, mình sẽ dùng nó để lấy file.

![4.6.1_g9esur](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276853/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.6.1_g9esur.png)

Thành công! Giờ thì mình sẽ thử tải một ảnh lên S3 để thử tiếp kết quả, và thử viết một file html đơn giản để show ảnh.

![4.6.2_vmudag](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276859/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.6.2_vmudag.png)

![4.6.3_mcyseh](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276854/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.6.3_mcyseh.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Centered Image</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="flex items-center justify-center h-screen bg-gray-100">
    <img
      src="http://<ec2-public-ipv4>:5000/files/IMG_2790.JPG"
      alt="Centered Image"
      class="rounded shadow-md w-[480px]"
    />
  </body>
</html>
```

Kết quả

![4.6.4_yl2auv](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276857/portfolio/blogs/s3-examples-get-object-from-s3-securely/4.6.4_yl2auv.png)

### Clean up resources

Để có thể làm được bài sau, thì bạn chỉ cần tắt máy chủ đang chạy là được.

- Vào lại **EC2 Console**, chọn vào máy chủ mà mình đã tạo lúc nãy.
- Xổ thanh **Instance state** xuống.
- Chọn **Stop instance**.

## Pricing

![pricing_aj5q6m](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737276858/portfolio/blogs/s3-examples-get-object-from-s3-securely/pricing_aj5q6m.png)
