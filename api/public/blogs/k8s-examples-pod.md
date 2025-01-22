Để ôn lại những gì mà bữa giờ mình đã học thì mình sẽ buộc phải thực hành những cái đó. Bao gồm những lý thuyết như sau:

- Pod
- ReplicaSet
- Deployment
- Service (NodePort, ClusterIP)

Mình sẽ chia thành nhiều bài khác nhau.

**Note**: bài thực hành này mình thực hiện trên EC2 t2.medium.

**Note**: trước khi làm được bài ví dụ này thì hãy đảm bảo bạn đã cài đặt thành công K8S Control Plane ở trong bài hướng dẫn trước đó.

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

Tạo từng tiệp sau trong các thư mục tương ứng

Tạo **a-service/index.js**

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

Tạo **b-service/index.js**

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

Tạo **package.json**

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

Sau đó trong mỗi thư mục tạo thêm 2 file dockerfile có nội dung như sau

```dockerfile
FROM node:20.17.0-alpine3.19

WORKDIR /root/app

# Copy all to directory
COPY . /root/app/

# Install dependencies
RUN npm install

CMD ["npm", "start"]
```

Kết quả mình sẽ được thư mục project trông như thế này

![]()

Xong rồi đó, chuẩn bị cho ví dụ đầu tiên thôi.

### Push images to Dockerhub

Trước tiên là bạn phải có tài khoản docker để có thể tải được image lên trên dockerhub. Sau đó thì nhập lệnh

```bash
sudo docker login
```

Nó sẽ hiện code lên màn hình và bạn phải vào trong trang `https://login.docker.com/activate`

![]()

![]()

Như vậy là đã đăng nhập thành công. Bước tiếp theo là mình sẽ tạo repository mới có 2 service A và B với tên lần lượt là **a-service** và **b-service**. Lúc này thì mình sẽ có tag cho mỗi service là **<dockerhub-username>/a-service** hoặc **<dockerhub-username>/b-service**.

![]()

Ở trên máy ảo, mình sẽ tạo ra 2 images, các bạn có thể tự push lên hoặc dùng image của mình:

```bash
sudo docker build a-service -t nguyenanhtuan19122002/a-service
sudo docker build a-service -t nguyenanhtuan19122002/b-service
```

![]()

Giờ thì push 2 images này lên

```bash
sudo docker push nguyenanhtuan19122002/a-service
sudo docker push nguyenanhtuan19122002/b-service
```

![]()

![]()

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
kubectl get pods
```

![]()

Done vậy là 2 pods chạy thành công!!!

Và có vẻ như hiện tại vẫn chưa có thể ping được tới một trong 2 pods

![]()

Về vấn đề này thì mình sẽ giải quyết nó trong ví dụ sau.

#### Deploy with YAML (Definition File)

Ở trong phần trước thì mình đã triển khai với CLI, ở phần này thì mình sẽ triển khai với YAML. Đầu tiên là mình cần phải tạo một file YAML.

```bash
kubectl delete pod a-service b-service
cd app
touch a-service-pod.yml b-service-pod.yml
```

Tạo file yaml cho **service a**

```bash
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

Tạo file yaml cho **service b**

```bash
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

Sau đó thì mình sẽ chạy lệnh để tạo ra các pods dựa theo 2 files yaml này.

```bash
kubectl create -f a-service-pod.yml
kubectl create -f b-service-pod.yml
```

![]()

Ok, đã triển khai 2 services thành công. Trong các ví dụ sau mình sẽ test thử 2 services này.

![]()

Vậy là đã xong, chúc các bạn thành công.
