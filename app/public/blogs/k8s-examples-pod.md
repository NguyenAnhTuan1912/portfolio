Để ôn lại những gì mà bữa giờ mình đã học thì mình sẽ buộc phải thực hành những cái đó. Bao gồm những lý thuyết như sau:

- Pod
- ReplicaSet
- Deployment
- Service (NodePort, ClusterIP)

Mình sẽ chia thành nhiều bài khác nhau.

**Note**: bài thực hành này mình thực hiện trên EC2 **t2.medium**, EBS **12 GiB**.

**Note**: trước khi làm được bài ví dụ này thì hãy đảm bảo bạn đã cài đặt thành công K8S Control Plane ở trong bài hướng dẫn trước đó, [xem thêm ở đây](/blogs/create-k8s-cluster-with-aws-kubeadm).

## Implementation

### Example applications

Ở đây mình sẽ viết ra 2 ứng dụng để làm ví dụ có tên lần lượt là **Service A** và **Service B**.

Đầu tiên là tạo ra các thư mục code

```bash
mkdir -p app/a-service app/b-service
cd app
touch a-service/index.js a-service/package.json a-service/dockerfile
touch b-service/index.js b-service/package.json b-service/dockerfile
```

![1.1_okzggx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255591/portfolio/blogs/k8s-examples-pod/1.1_okzggx.png)

Sau đó là thêm mã Javascript vào từng file tương ứng.

Đầu tiên là file **a-service/index.js**

```js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const servicebEndpoint = "http://localhost";

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  try {
    return res.send("Service A: hello, I am service A, nice to meet you");
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

app.get("/b-greeting", (req, res) => {
  try {
    return res.send("Service A: I receive message from service B, thank you");
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

app.get("/to-b", (req, res) => {
  try {
    const response = axios.get(`${servicebEndpoint}/a-greeting`);
    return res.send(response.data);
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "3000";

// Start the server
app.listen(HOST, PORT, () => {
  console.log(`App listening at http://${HOST}:${PORT}`);
});
```

Tiếp theo là file **b-service/index.js**

```js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const servicebEndpoint = "http://localhost";

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  try {
    return res.send("Service B: hello, I am B");
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

app.get("/a-greeting", (req, res) => {
  try {
    return res.send(
      "Service B: I receive message from service A, say hello to you"
    );
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

app.get("/to-b", (req, res) => {
  try {
    const response = axios.get(`${servicebEndpoint}/b-greeting`);
    return res.send(response.data);
  } catch (error) {
    res.status(500);
    return res.send(error.message);
  }
});

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "5000";

// Start the server
app.listen(HOST, PORT, () => {
  console.log(`App listening at http://${HOST}:${PORT}`);
});
```

Khi thêm xong thì kết quả sẽ trông như thế này.

![1.2_kxyczd](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255591/portfolio/blogs/k8s-examples-pod/1.2_kxyczd.png)

Tiếp theo, mở lần lượt các file **package.json** trong **a-service** và **b-service** để thêm các nội dung như sau

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "module-alias": "^2.2.3",
    "axios": "^1.7.7"
  },
  "scripts": {
    "start": "node index.js"
  },
  "_moduleAliases": {
    "src": "./src"
  }
}
```

Kết quả

![1.3_kloxln](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255591/portfolio/blogs/k8s-examples-pod/1.3_kloxln.png)

Và cuối cùng là mở các **dockerfile** ở trong **a-service** và **b-service**. Sau đó thêm nội dung vào trong từng file như bên dưới.

```dockerfile
FROM node:20.17.0-alpine3.19

WORKDIR /root/app

# Copy all to directory
COPY . /root/app/

# Install dependencies
RUN npm install

CMD ["npm", "start"]
```

Kết quả

![1.4_y8fkah](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255591/portfolio/blogs/k8s-examples-pod/1.4_y8fkah.png)

Ok, như vậy thì bước chuẩn bị đã xong rồi, trong bước tiếp theo thì chúng ta sẽ tiến hành đẩy image lên trên Dockerhub. Bởi vì K8S sẽ không lấy các image ở trong local ra để dùng, mà nó sẽ đẩy các image đó từ trên Container Image Registry xuống để xài.

### Push images to Dockerhub

Trước tiên là bạn phải có tài khoản docker để có thể tải được image lên trên dockerhub. Sau đó thì nhập lệnh

```bash
sudo docker login
```

![2.1_stw5fy](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.1_stw5fy.png)

Nó sẽ hiện code lên màn hình và bạn phải vào trong trang `https://login.docker.com/activate`. Nhập code vào trong ô nhập.

![2.2_xber6s](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.2_xber6s.png)

Tiếp tục ấn **Confirm**.

![2.3_pxtmw7](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.3_pxtmw7.png)

Và chúng ta sẽ nhận được thông báo thành công trên trình duyệt và trong Terminal.

![2.4_ff8fpc](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255600/portfolio/blogs/k8s-examples-pod/2.4_ff8fpc.png)

![2.5_pov7np](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.5_pov7np.png)

Như vậy là đã đăng nhập thành công. Bước tiếp theo là mình sẽ tạo repository mới có 2 service A và B với tên lần lượt là **a-service** và **b-service**. Ở bước này thì bạn không cần tạo cũng được, vì khi gắn tag cho image dưới local thì khi đẩy lên, Dockerhub sẽ tự tạo repository.

Ở trên máy ảo, mình sẽ tạo ra 2 images, các bạn có thể tự push lên hoặc dùng image của mình:

Với **a-service**

```bash
cd app
sudo docker build a-service -t nguyenanhtuan19122002/a-service
```

![2.6_ah3i3d](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.6_ah3i3d.png)

Với **b-service**

```bash
cd app
sudo docker build b-service -t nguyenanhtuan19122002/b-service
```

![2.7_mbfa1v](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255591/portfolio/blogs/k8s-examples-pod/2.7_mbfa1v.png)

Kiểm tra lại xem 2 images đã build thành công hay chưa?

```bash
sudo docker images
```

![2.8_uexe31](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255600/portfolio/blogs/k8s-examples-pod/2.8_uexe31.png)

Giờ thì push 2 images này lên

```bash
sudo docker push nguyenanhtuan19122002/a-service
sudo docker push nguyenanhtuan19122002/b-service
```

![2.9_l57sfk](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255601/portfolio/blogs/k8s-examples-pod/2.9_l57sfk.png)

Kiểm tra trên Dockerhub

![2.10_a7uahr](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/2.10_a7uahr.png)

Đã xong, chuẩn bị tiến hành triển khai ứng dụng thôi!

### Deploy

Giờ thì mình sẽ triển khai 2 services này trên 2 pods khác nhau với các options

- Triển khai bằng câu lệnh
- Triển khai bằng file YAML

#### Deploy with only kubectl

Đầu tiên là với câu lệnh

```bash
kubectl run a-service --image=nguyenanhtuan19122002/a-service
kubectl run b-service --image=nguyenanhtuan19122002/b-service
```

![3.1_dgeb6y](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255600/portfolio/blogs/k8s-examples-pod/3.1_dgeb6y.png)

Kiểm tra lại

```bash
kubectl get pods
```

![3.2_ai36ao](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/3.2_ai36ao.png)

Done vậy là 2 pods chạy thành công!!!

#### Deploy with YAML (Definition File)

Ở trong phần trước thì mình đã triển khai với CLI, ở phần này thì mình sẽ triển khai với YAML (Definition File). Đầu tiên là mình cần phải tạo một file YAML. Trước tiên là chúng ta phải xoá các pod đã triển khai ở phần trước và tạo ra các file YAML mới.

```bash
kubectl delete pod a-service b-service
cd app
touch a-service-pod.yml b-service-pod.yml
```

![3.3_uyknll](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255600/portfolio/blogs/k8s-examples-pod/3.3_uyknll.png)

Mở các file YAML mới tạo lên, sau đó là nhập các nội dung như sau vào từng file YAML.

Với **a-service-pod.yml**

```yml
apiVersion: v1
kind: Pod
metadata:
  name: a-service
spec:
  containers:
    - name: a-service-app
      image: nguyenanhtuan19122002/a-service
      ports:
        - containerPort: 3000
```

Với **b-service-pod.yml**

```yml
apiVersion: v1
kind: Pod
metadata:
  name: b-service
spec:
  containers:
    - name: b-service-app
      image: nguyenanhtuan19122002/b-service
      ports:
        - containerPort: 5000
```

![3.4_apzep2](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255593/portfolio/blogs/k8s-examples-pod/3.4_apzep2.png)

Sau đó thì mình sẽ chạy lệnh để tạo ra các pods dựa theo 2 files yaml này.

```bash
kubectl create -f a-service-pod.yml
kubectl create -f b-service-pod.yml
```

![3.5_ptuebp](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255592/portfolio/blogs/k8s-examples-pod/3.5_ptuebp.png)

Kiểm tra lại kết quả với `kubectl get pods`

![3.6_roxpdc](http://res.cloudinary.com/dhqgfphiy/image/upload/v1739255600/portfolio/blogs/k8s-examples-pod/3.6_roxpdc.png)

Như vậy thì chúng ta vừa mới làm xong ví dụ triển khai ứng dụng với Pod theo 2 cách là dùng trực tiếp với `kubectl` và dùng file YAML với `kubectl`. Hẹn gặp lại ở ví dụ sau!
