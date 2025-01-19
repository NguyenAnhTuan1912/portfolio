Trong bày này mình sẽ hướng dẫn cho các bạn các để có thể triển khai được một Single Node K8S Cluster để bắt đầu cho chuỗi bài ví dụ về K8S sau này. Trước khi đi vào phần cài đặt, thì chúng ta phải đi qua một số nội dung trước đã.

## What is Kubernetes?

Cho những ai chưa biết, thì **Kubernetes** là một công cụ mạnh mẽ, linh hoạt dùng để điều phối các containers (**Container Orchestrator**). Trước đây, các hệ thống sẽ triển khai nhiều ứng dụng trong một host với máy ảo (Virtual Machine) nhằm đảm bảo cô lập, tách biệt tài nguyên của nhiều ứng dụng với nhau.

![]()

Tuy nhiên **VM** có một vấn đề là nó quá nặng, về dung lượng, **CPU** cũng như **RAM** để chạy một task mà đúng ra nếu không có **VM** thì sẽ nhẹ hơn rất nhiều. Nắm bắt được vấn đề đó thì người ta mới ra đời một khái niệm là Containerized Application / Program, là những application được chạy ở trong container.

Container giống với **VM**, nhưng khác với **VM** là nó không có phần OS riêng, thay vào đó nó sẽ giao tiếp thẳng với Kernel của hệ điều hành chủ (Host OS) mà không cần phải có OS của riêng nó ⇒ từ đó giúp cho Container nhẹ **VM** rất rất nhiều, mà tốc độ cũng như các tính chất giống VM được đảm bảo.

![]()

Nhưng khi hệ thống có nhiều container hơn thì làm sao để mà chúng ta có thể quản lý được các containers đó một cách hiệu quả mà không gây ảnh hưởng tới hệ thống? Và trong một DataCenter không chỉ có duy nhất một Host, mà sẽ có rất nhiều Host? Đó là lý do vì sao các **Container Orchestrator** được sinh ra để làm việc đó.

Vậy thì quay trở lại với **Kubernetes**, thì làm sao mà nó có thể điều phối các Containers?

## K8S Cluster

Trong **K8S**, nó sẽ quản lý các Host / Machine trong một vùng được gọi là **Cluster**, và các Host / Machine này sẽ được gọi là Node, các Node này sẽ thực hiện một hoặc nhiều Task nào đó bằng cách chạy Pods (đơn vị triển khai nhỏ nhất trong **K8S**) bên trong nó, mỗi Pod có thể chạy một hoặc nhiều Containers để làm tác vụ đó, nó chỉ đơn giản như vậy thôi. Và vấn đề tiếp theo là mình sẽ quản lý các Node này như thế nào?

Sẽ có một hoặc nhiều Node(s) được gọi là Control Plane, nó chịu trách nhiệm cho việc quản lý và điều phối các Node.

![]()

Về bản chất thì **Control Plane** cũng là Node, những có các thành phần đặc biệt hơn, các thành phần đó là:

- **API Server**: là chung tâm của mọi hoạt động quản lý trong K8S.
- **Controller**: là thành phần chịu trách nhiệm điều khiển, giúp cho các thành phần khác đạt được Desired State.
- **etcd**: là một key-value storage, giúp lưu trữ thông tin của các thành phần, tài nguyên trong cluster.
- **Scheduler**: là thành phần chịu trách nhiệm khởi tạo Pod.

Và để cho một Host / Machine có thể được gọi là K8S Node, bất kể là trên cloud hay trong môi trường truyền thống thì đều phải có được các thành phần như sau (các thành phần này cần phải đặc biệt lưu ý vì mình sẽ cần nó để cài **Control Plane**):

- **Kubelet**: là một K8S Agent, có nhiệm vụ là quan sát mọi hoạt động trong Node.
- **Container Runtime**: coi như là huyết mạch của Node, các thành phần trong **Control Plane** đều là Pod, mà Pod cần phải có CR mới có thể hoạt động được.

![]()

Mình chỉ giới thiệu đơn giản vậy thôi, các bạn có thể tham khảo thêm ở trong tài liệu chính thức của K8S, [tại đây]().

## Prerequisites

Trước khi setup **Control Plane**, thì các bạn phải cần lưu ý:

- Đã học qua về **Docker**.
- Có tài khoản AWS để tạo một máy ảo **EC2 t2.medium**.
- Có VSCode (khuyến khích).

Để có thể setup được control plane thì chúng ta cần phải:

- Container Runtime, mình sẽ dùng luôn của Docker.
- **CRI-DockerD**, vì K8S không còn support Docker như trước nữa, nên cần phải có một interface để K8S giao tiếp với CR của Docker.
- **Kubelet**.
- Các CLI như kubectl, kubeadm.
- **Calico**, là một network addon.

## Let's setup

Trong bài này mình dùng máy Ubuntu, nên mọi câu lệnh thao tác sẽ theo Ubuntu nhiều hơn, tuy nhiên, nếu bạn dùng máy khác thì vẫn có thể thay thế được.

### Install Docker

Đầu tiên chúng ta cần phải cài GPG Key chính thức của Docker

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

![]()

Sau đó là thêm Docker Repository vào trong Apt sources

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

![]()

Sau đó là cài Docker và một số công cụ khác của nó.

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

![]()

Kiểm tra docker đã cài thành công hay chưa

![]()

Ok, như vậy là chúng ta đã hoàn thành được bước đầu tiên.

### Install cri-dockerd

Tiếp theo, chúng ta sẽ tải CRI cho K8S để giao tiếp với **CR** của Docker với đường dẫn sau

```bash
wget https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.15/cri-dockerd-0.3.15.amd64.tgzwget https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.15/cri-dockerd-0.3.15.amd64.tgz
```

Note: nếu không có wget thì bạn nên cài với lệnh `curl -o`.

![]()

Sau đó chúng ta sẽ giải nén file này ra được một folder, truy vập vào folder này để lấy file bin ra và di chuyển vào trong `/usr/local/bin`.

```bash
tar xvf cri-dockerd-0.3.15.amd64.tgz
cd cri-dockerd
sudo mv cri-dockerd /usr/local/bin/
```

![]()

![]()

Sau đó, chúng ta sẽ cài đặt Service cho **CRI-Dockerd**.

```bash
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket
sudo mv cri-docker.socket cri-docker.service /etc/systemd/system/
sudo sed -i -e 's,/usr/bin/cri-dockerd,/usr/local/bin/cri-dockerd,' /etc/systemd/system/cri-docker.service
```

![]()

Và khởi động service này

```bash
sudo systemctl daemon-reload
sudo systemctl start cri-docker.service
sudo systemctl start --now cri-docker.socket

# Kiểm tra status
sudo systemctl status cri-docker.socket
```

![]()

![]()

Ok, như vậy là chúng ta đã xong bước thứ 2.

### Install Kubeadm, Kubectl and Kubelet

Tiếp theo, để có thể tạo được control plane cũng như là thao tác với nó, thì mình cần phải có được **kubeadm**, **kubectl** và **kubelet** (đã có CR).

Đầu tiên thì chúng ta sẽ update apt package và cài một số package cần thiết để dùng repository của K8S:

```bash
sudo apt-get update
# apt-transport-https may be a dummy package; if so, you can skip that package
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
```

Sau đó là tải public signing key cho K8S package repositories.

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

![]()

Sau đó là thêm K8S repositories

```bash
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

![]()

Cuối cùng là cài đặt **kubeadm**, **kubectl** và **kubelet**.

```bash
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

![]()

### Init control plane

Sau khi đã cài đặt xong thì giờ chúng ta có thể khởi tạo được control plane ở trong Node này.

```bash
sudo kubeadm init --pod-network-cidr=192.168.0.0/16 --cri-socket=unix:///var/run/cri-dockerd.sock
```

Note: `--pod-network-cidr` các bạn có thể thay đổi, nhưng không được thay đổi `--cri-socket`.

![]()

Tạo xong thì sẽ nhận được message như này

![]()

Và để cho người dùng `ubuntu` có thể dùng được Control Plane, thì chúng ta sẽ cần phải copy `/etc/kubernetes/admin.conf` vào trong `$HOME/.kube/config`.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

![]()

Giờ thử tương tác với cluster thông qua `kubelet`.

![]()

Vậy là đã thành công!!!

Nhưng tới đây thì mình sẽ cần cài thêm một số thứ nữa để pod có thể giao tiếp được với nhau. Có thể thấy là chúng ta có thể tạo được Pod, nhưng nó không chạy.

![]()

Mình sẽ có 2 hướng là chạy Cluster với **Single Node** hoặc **Multiple Node**, nhưng trong bài này mình hướng dẫn là **Single Node**, tiếp theo thì chúng ta sẽ cần phải thiết lập một số thứ nữa.

### Install Calico

Giờ thì chúng ta sẽ cài thêm Addon cho cluster, Addon này sẽ chạy dưới dạng Pod, trong namespace là `kube-system`.

```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

![]()

Chạy Pod xong, thì mình sẽ kiểm tra xem các Pods đã chạy được hay chưa?

```bash
kubectl get pods -A
```

![]()

Tiếp theo là kiểm tra xem Node đã `Ready` hay chưa?

```bash
kubectl get nodes
```

![]()

Như vậy là Node của chúng ta đã gần như là sẵn sàng để triển khai được một ứng dụng mẫu đầu tiên.

### Allow control plane schedules nodes (Single-node K8S Cluster)

Theo mặc định thì chúng ta sẽ không được phép tạo pod bình thường trên **Control Plane**, vì một số vấn đề về bảo mật, nhưng trong bài này chúng ta sẽ khởi tạo Single-node K8S Cluster, cho nên chúng ta sẽ cho phép **Control Plane** tạo Pods.

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

![]()

### Test result

Sau khi cài đặt xong thì chúng ta thử triển khai lại Pod chạy Nginx và truy vập vào trang web mặc định của **Nginx**.

```bash
kubectl run nginx --image=nginx
```

![]()

Vậy là giờ Pod đã chạy thành công, giờ thì chúng ta sẽ cần phải mở port cho Pod này bằng cách tạo một service (NodePort service) cho phép truy cập từ bên ngoài vào trong Pods.

```bash
# Tạo NodePort service
kubectl expose pod nginx --type=NodePort --port=80

# Kiểm tra service
kubectl get services
```

![]()

Lưu ý với port **32589**, mình sẽ cho phép access từ port này từ ngoài máy ảo (qua địa chỉ IPv4 của nó) trong Security Group.

Kết quả cuối cùng chúng ta sẽ có được là

![]()

## Conclusion

Như vậy là chúng ta đã triển khai thành công một **K8S Cluster** và chạy thử một ứng dụng mẫu ở trên đó. Nếu như các bạn đã đi được tới đây thì chúc mừng các bạn đã thành công trong việc triển khai.

Ở các bài sau thì chúng ta sẽ thực hiện một số các ví dụ về triển khai Pods.
