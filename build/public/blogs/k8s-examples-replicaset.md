Ở trong ví dụ **K8S - Pod** trước, thì chúng ta đã triển khai pod với dạng resource `kind: Pod`, còn trong ví dụ này thì chúng ta sẽ triển khai pod với **ReplicaSet**.

Tương tự, trong bài này mình sẽ vẫn dùng **EC2 t2.medium** để thực hiện các ví dụ, và bài này mình sẽ đi nhanh thôi. Bắt đầu thôi!

## What is ReplicaSet?

**ReplicaSet** là một trong những loại tài nguyên của K8S Cluster, nó chịu trách nhiệm cho việc triển khai nhiều Pods cho cùng một task, hay hiểu đơn giản là nó sẽ `triển khai nhiều Pods giống nhau`. **ReplicaSet** đóng vai trò quan trọng trong việc mở rộng (**scale ou**t) hoặc là thu gọn (**scale in**) các Pods trong Node.

Về sau thì mình sẽ còn học thêm về một **Addon** là **Karpenter** hoặc **Auto Scaler**, cũng được dùng để mở rộng và thu gọn tài nguyên trong K8S Cluster. Nhưng thay vì thao tác trên Pods thì Addon này sẽ thao tác với các Nodes trên Cloud.

![0.1_vxncxx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347275/portfolio/blogs/k8s-examples-replicaset/0.1_vxncxx.png)

**ReplicaSet** sẽ luôn điều chỉnh số Pods về đúng với số Pods mà mình đã cấu hình cho nó từ trước đó, gọi là **Desired State**. Ngoài ra, khi làm việc với K8S thì mình cũng sẽ cần phải nắm được **Desired State** của các resource mà mình tạo ra.

## ReplicaSet Definition

Để có thể triển khai được ReplicaSet, giống như cách mà mình triển khai **Pod**, nhưng sẽ có thêm một số trường đặc biệt như là `selector`, `replicas`, `template`, đặc biệt là `selector`.

```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
  labels:
    app: my-replicaset
spec:
  # Định nghĩa số pods sẽ được triển khai
  replicas: 2
  # Quan trọng: cho biết là ReplicaSet này sẽ theo dõi các Pods
  # có label là app: my-app-frontend.
  # Về sau thì có thể sẽ còn phức tạp hơn khi mà Cluster có nhiều
  # thành phần hơn.
  selector:
    matchLabels:
      app: my-app-frontend
  # Dùng để định nghĩa các Pods, sao cho số Pods mà nó đang theo dõi
  # bằng với số trong replicas, trong trường hợp ít hơn.
  # Nhìn chung thì nó bên phần metadata của Pod sang đây.
  template:
    metadata:
      labels:
        app: my-app-frontend
      spec:
        containers:
          - name: a-service
            image: nguyenanhtuan19122002/a-service
```

## Questions

Trước khi đi vào trong làm ví dụ, thì mình có một số câu hỏi:

- **ReplicaSet** có thể triển khai nhiều loại Pod khác nhau không? Dựa vào template.
- Nếu như Pod tồn tại trước **ReplicaSet** thì sao?
- Nếu như một Pod được "xem" bởi 2 RepilcaSet khác nhau thì sẽ như thế nào?
- Nếu như `matchLabels` của **replicaset** mà không match với `labels` trong `template` của **ReplicaSet** thì sẽ như thế nào?
- Mình sẽ thực hiện việc scale pods như thế nào?
- `template` có cần thiết trong file definition của replica không?

Trong phần này chúng ta sẽ trả lời các câu hỏi này!

## Implementation

Bắt đầu thôi

### Create 2 pods

Đầu tiên, mình sẽ thực hiện việc tạo ra 2 pods trước, cho một là cho a service và hai là cho b service. Mình sẽ lấy lại các file defiintion trong bài trước, như sẽ thêm label cho các pods này.

Sửa lại definition của service A

```yml
apiVersion: v1
kind: Pod
metadata:
  name: a-service
  labels:
    app: a-app
spec:
  containers:
    - name: a-service-app
      image: nguyenanhtuan19122002/a-service
      ports:
        - containerPort: 3000
```

Sửa lại definition của service B

```yml
apiVersion: v1
kind: Pod
metadata:
  name: b-service
  labels:
    app: b-app
spec:
  containers:
    - name: b-service-app
      image: nguyenanhtuan19122002/b-service
      ports:
        - containerPort: 5000
```

![1.1_ulpoms](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347275/portfolio/blogs/k8s-examples-replicaset/1.1_ulpoms.png)

Tạo pod cho 2 services

```bash
kubectl create -f a-service-pod.yml
kubectl create -f b-service-pod.yml
```

Và 2 pods đều chạy ổn

![1.2_d72q7i](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347276/portfolio/blogs/k8s-examples-replicaset/1.2_d72q7i.png)

### Create ReplicaSet

Giờ thì chúng ta tiến hành tạo 2 replicasets cho mỗi service như sau:

Tạo `a-replicaset.yml` với nội dung như sau

```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: a-replicaset
  labels:
    app: a-replicaset
spec:
  replicas: 2
  selector:
    matchLabels:
      app: a-app
  template:
    metadata:
      name: a-service
      labels:
        app: a-app
    spec:
      containers:
        - name: a-service-app
          image: nguyenanhtuan19122002/a-service
          ports:
            - containerPort: 3000
```

Tạo `b-replicaset.yml` với nội dung như sau

```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: b-replicaset
  labels:
    app: b-replicaset
spec:
  replicas: 3
  selector:
    matchLabels:
      app: b-app
  template:
    metadata:
      name: b-service
      labels:
        app: b-app
    spec:
      containers:
        - name: b-service-app
          image: nguyenanhtuan19122002/b-service
          ports:
            - containerPort: 5000
```

Khi tạo 2 replicaset này xong thì mình sẽ được tổng là 5 pods, vì `replicas` trong a-replicaset có **3** và `replicas` trong a-replicaset có **2**.

Tiếp theo là triển khai các ReplicaSet này

```bash
kubectl create -f a-replicaset.yml
kubectl create -f b-replicaset.yml
```

![2.1_nxwf9i](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347277/portfolio/blogs/k8s-examples-replicaset/2.1_nxwf9i.png)

![2.2_xlifxt](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347278/portfolio/blogs/k8s-examples-replicaset/2.2_xlifxt.png)

Xong! Bạn có thể thấy là các thông tin của replicaset gồm **DESIRED**, **CURRENT** và **READY** và mình có thể thấy là các thông số đó giống nhau và đúng với số replicas đã cài đặt trước đó trong mỗi replicaset ⇒ như vậy là triển khai thành công. Và cho dù pod có tạo trước cả replicaset, thì replicaset vẫn có thể theo dõi nó được.

**Note**: sẽ có lỗi xảy ra khi mà mình không có phần template trong file.

![2.3_ywkiso](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347279/portfolio/blogs/k8s-examples-replicaset/2.3_ywkiso.png)

Nên giờ mình sẽ phải thêm phần này vào trong definition file của mỗi replicaset. Và mình cũng có thể thấy là `label` trong `matchLabels` của selector cũng phải trùng với label trong `template.metadata`.

### Create one more ReplicaSet which has same selector with one of existed replicasets

Giờ thì mình sẽ tiến hành tạo thêm một replicaset nữa, replicaset này sẽ có cùng giá trị `selector` với một trong 2 replicaset đã tạo trước đó, ngoài ra sẽ có nhiều `replicas` hơn. Mình sẽ chọn **a-replicaset**, và thử xem có tạo được không?

Tạo một file definition mới

```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: invalid-replicaset
  labels:
    app: invalid-replicaset
spec:
  replicas: 4
  selector:
    matchLabels:
      app: a-app
  template:
    metadata:
      name: a-service
      labels:
        app: a-app
    spec:
      containers:
        - name: a-service-app
          image: nguyenanhtuan19122002/a-service
          ports:
            - containerPort: 3000
```

Nếu như có thể tạo được, thì số pod của service A sẽ được tăng lên 4, nhưng có bị conflict với replicaset trước đó hay không thì thử xem nhé.

```bash
kubectl create -f a-replicaset-dup.yml
```

![3.1_jjycov](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347280/portfolio/blogs/k8s-examples-replicaset/3.1_jjycov.png)

![3.2_umllhw](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347282/portfolio/blogs/k8s-examples-replicaset/3.2_umllhw.png)

Như vậy thì mình có thể thấy là, vẫn có thể tạo được replicaset với cùng một label. Nhưng sao có thể? Giờ mình sẽ tìm hiểu sâu hơn.

Giờ mình sẽ xoá replicaset cũ đi, sau đó là sửa lại tên của **a-replicaset-dup** trùng với tên của **a-replicaset**, sau đó tạo lại và xem chuyện gì sẽ xảy ra.

![3.3_m96dkf](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347285/portfolio/blogs/k8s-examples-replicaset/3.3_m96dkf.png)

Có thể thấy là mình không thể tạo được vì đã có replicaset với tên đó đã tồn tại ⇒ Như vậy mình có thể kết luận là các pods cho dù có cùng một label giống nhau, thì vẫn có thể được quản lý bởi các replicaset khác nhau và replicaset không chỉ quản lý các pod dựa trên label, mà có thể còn dựa trên cả tên của pod.

Như vậy thì mình có thể thấy là các pod này về cơ bản là khác nhau, nó sẽ đều có một ID ẩn ở bên dưới, nhưng cái mà làm cho nó giống nhau, hay có thể nhóm các pod đó lại với nhau là **Label**.

### Scale out pods

Hiện tại thì mình đang còn lại 2 replicasets, trước đó tạo 1 và xoá một.

![4.1_ek4aep](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347285/portfolio/blogs/k8s-examples-replicaset/4.1_ek4aep.png)

Giờ mình sẽ thực hiện việc scale out 2 replicaset này lên.

Đầu tiên là với a-replicaset.

```bash
kubectl scale --replicas=5 replicaset/a-replicaset
```

![4.2_en9ujj](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347286/portfolio/blogs/k8s-examples-replicaset/4.2_en9ujj.png)

Như vậy mình đã scale thành công.

Nhưng với **b-replicaset** thì mình sẽ scale theo kiểu khác, giờ thì mìn sẽ sửa lại `replicas` trong definition file của **b-replicaset**. Và dùng lệnh

```bash
kubectl apply -f b-replicaset.yml
```

![4.3_wugbml](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347295/portfolio/blogs/k8s-examples-replicaset/4.3_wugbml.png)

Vẫn thành công! Vậy thì điểm khác biệt giữa 2 cách scale như này là như thế nào? Điểm khác biệt rõ ràng nhất là **b-replicaset** thì được sửa lại definition file còn **a-replicaset** thì cũng được sửa lại definition file, nhưng mà là bản copy mà **Control Plane** đang giữ.

![4.4_fxol36](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347295/portfolio/blogs/k8s-examples-replicaset/4.4_fxol36.png)

Tạm thời là hiểu như vậy.

### Scale in pods

Còn giờ thì mình sẽ scale về như cũ với 2 cách luôn. Đầu tiên là với **a-replicaset**, để có thể scale in thì mình chỉ cần chỉnh lại số replicas ít hơn số hiện tại là được. Ví dụ như `replicas: 5` thì chỉnh thành `replicas: 2` thì replicaset sẽ tự động destroy bớt Pods đi để về lại **DESIRED** state mới

```bash
kubectl scale --replicas=2 replicaset a-replicaset
```

![5.1_gcer8l](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347296/portfolio/blogs/k8s-examples-replicaset/5.1_gcer8l.png)

Xong, không ảnh hưởng gì tới definition file ban đầu.

Giờ mình sẽ chỉnh lại definition file của **b-replicaset** về lại như cũ để scale in và dùng lại lệnh.

```bash
kubectl apply -f b-replicaset.yml
```

![5.2_acwvku](http://res.cloudinary.com/dhqgfphiy/image/upload/v1737347296/portfolio/blogs/k8s-examples-replicaset/5.2_acwvku.png)

Xong, đã về như cũ, như vậy thì mình có thể thấy là mình có 2 cách để scale, một là dùng `kubectl scale`; hai là chỉnh lại definition file và dùng `kubectl apply`.

Nếu bạn đã làm tới đây thì chúc mừng bạn đã thành công, hẹn ở một ví dụ khác.

## Conclusion

Như vậy thì mình mình có thể điều chỉnh được số pods trong hệ thống với ReplicaSet để phù hợp với tình hình hiện tại.
