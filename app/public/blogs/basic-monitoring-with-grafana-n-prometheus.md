Trong bài này thì chúng ta sẽ đi thực hiện setup một ứng dụng và chúng ta sẽ thực hiện quan sát, đánh giá ứng dụng này (Monitoring) với Prometheus và Grafana. Ứng dụng này thì được mình viết bằng Typescript Node, link ứng dụng đó thì mình để ở đây: https://github.com/NguyenAnhTuan1912/basic-monitoring

## What is Prometheus?

Prometheus là một công cụ được dùng để cho phép mình có thể thu hoạch (collect) các chỉ số (metric) ở trong ứng dụng, trong nhiều ứng dụng của hệ thống. Từ các metric này thì chúng ta có thể thực hiện việc quan sát và đánh giá (monitoring) để hiểu hơn về hiệu năng, cũng như là phát hiện được các bất thường ở trong hệ thống.

Khi collect metric, thì chúng ta sẽ cần có Prometheus Client để collect và expose (mở) một endpoint để cho phép Prometheus có thể gửi request tới và lấy dữ liệu đã được thu lại. Ngoài ra khi startup Prometheus thì mình sẽ cần phải thêm Job để nó tự động gửi request chính cái endpoint kia của ứng dụng được setup để lấy các metric.

![prometheus cheat sheet](https://iximiuz.com/prometheus-functions-agg-over-time/agg_over_time-2000-opt.png)

Để hiểu sâu hơn về prometheus, thì mình sẽ cần phải hiểu một số thứ ở tấm ảnh trên:

- `Metric`: nó giống như là một định lượng, mình có thể dùng nó để biết được thông tin nào đó. Trên hình thì mình có metric là `mem_bytes`. Vì nó là một định lượng, nên là mình có thể thu từ nhiều nguồn khác nhau. Để có thể phân biệt được thì mình sẽ gán nhãn cho nó, cái này mình gọi là Labeled metric :D.
- `mem_bytes`: là tên của metric. Sau nó có thêm `{instance="a"}` hoặc `{instance="b"}`, thì cái này gọi là labels, dùng để phân biệt các metric được collect từ đâu, bạn có thể sẽ nghe tới Dimension, chính là nó đấy.
- `Time series`: mỗi một labeled metric thì nó có 1 time series, nó là một cơ sở dữ liệu nhỏ dùng để lưu trữ lại các value được thu về và được map với 1 mốc thời gian nào đó, chính vì thế mà nó được gọi là time series.
- Prometheus có 2 value chính:
  - `Instant Vector`: là một bộ các time series (trên hình thì nó là `mem_bytes`) mà mỗi time series nó đều chứa một giá trị tại một thời điểm T nào đó. Nói cho dễ hiểu thì nó là một metric.
  - `Range Vector`: là một bộ các time series mà mỗi time series đều có nhiều giá trị tại nhiều thời điểm liên tục tương ứng. Nói cho dễ hiểu thì nó là một nhóm Instant Vector liên tục trong một khoảng thời gian T.
- Đa phần các phép tính trong prometheus (từ function) thì nó sẽ tính cho thời điểm hiện tại cho tới T thời gian trước đó. Nó sẽ cần tới Range Vector, để có được Range Vector thì mình dùng `instant_vector[T]` ở hình trên thì mình có `mem_bytes[T]` => Khi này thì mình có phép tính `avg_over_time(mem_bytes[T])` -> kết quả mình có là các điểm cam.

Mình giải thích tới đây thôi, bạn có thể tìm hiểu thêm về prometheus và quay lại xem hình này thì nó rất có ích đấy.

## What is Grafana?

Grafana cũng là một bộ công cụ giao diện giúp cho mình có thể tổng hợp được các nguồn dữ liệu từ 1 hoặc nhiều hệ thống hoặc một thành phần nào đó trong hệ thống để có thể tạo được cái Dashboard tổng quan để có thể giám sát hệ thống. Thông thường thì Grafana và Prometheus sẽ là một cặp đi cùng với nhau.

## Prerequisites

Để làm được bài này thì bạn cần phải chuẩn bị gì?

- **Node** và **Npm** hoặc **Pnpm** (NodeJS mình xài phiên bản `v22.18.0`).
- **Docker** trọn bộ (mình dùng phiên bản `28.2.2, build e6534b4`).
- **Jmeter** (phiên bản `5.6.3`) và Java (phiên bản `24.0.2`). Mình còn dùng tool này để load test ứng dụng nữa, bạn cũng có thể cân nhắc sử dụng tool này.
- **Ubuntu** hoặc bất kì **Linux Distro** (mình dùng WSL2 Ubuntu).

Mục tiêu bài này thì mình sẽ chủ yếu là setup và học cơ bản về Grafana và Prometheus, nên sẽ không tập chung vào code.

## Let's setup

Giờ thì chúng ta sẽ setup bài này thôi. Đầu tiên là tạo một workspace:

```bash
mkdir workspace && cd workspace
```

Sau đó là clone dự án của mình về.

```bash
git clone https://github.com/NguyenAnhTuan1912/basic-monitoring.git

# hoặc
git clone git@github.com:NguyenAnhTuan1912/basic-monitoring.git
```

Tiếp theo là chúng ta sẽ cần copy thư mục `tool-configs` trong mã nguồn dự án, mình sẽ dùng cho Jmeter và Grafana. Copy về windows, nhớ tạo thêm folder `workspace`.

```bash
sudo cp -R basic-monitoring/tool-configs/ /mnt/d/workspace
```

![prerequisites-2](/images/basic-monitoring-with-grafana-n-prometheus/prerequisites-2.png)

### Setup Grafana and Prometheus

Trong workspace, tạo thêm một thư mục nữa và vào thư mục này.

```bash
mkdir monitoring && cd monitoring
```

Chúng ta sẽ setup grafana và prometheus với docker. Đầu tiên là tạo file `docker-compose.yml` và `prometheus.yml`

```bash
touch docker-compose.yml && touch prometheus.yml
```

> Note: mấy lệnh này mình đã thử và cũng đã có tạo sẵn rồi nên mình sẽ không tạo lại. Bạn cứ làm theo như hướng dẫn là được.

Thêm đoạn cấu hình này vào file `docker-compose.yml`.

```yml
services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    container_name: grafana
    volumes:
      - ./data/grafana:/var/lib/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

Trong file `prometheus.yml` thì thêm cấu hình như bên dưới.

```yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["prometheus:9090"]

  # Sample monitorable application
  - job_name: "sma"
    static_configs:
      # IP Address of WSL / VM
      - targets: ["<replace_wsl2_ip>:<port_of_application>"]
```

> Note ở bước này thì bạn sẽ cần tìm địa chỉ của WSL2 và thêm nó như trong config, nhớ thay đổi nhé. Cùng với đó là port của application, mặc định là `7800`.

![setup-grafana-prometheus-1](/images/basic-monitoring-with-grafana-n-prometheus/setup-grafana-prometheus-1.png)

Tiếp theo là chúng ta sẽ tạo thêm một thư mục tên là `data/grafana` (giống như trên file `docker-compose.yml`). Và cho toàn bộ quyền để thao tác với thư mục `data` này.

```bash
mkdir -p data/grafana
sudo chmod 777 -R data
```

![setup-grafana-prometheus-2](/images/basic-monitoring-with-grafana-n-prometheus/setup-grafana-prometheus-2.png)

Sau khi setup xong rồi thì khởi động 2 containers này lên thôi. Và đợi một lúc để nó khởi động hoàn toàn.

```bash
docker compose up -d
```

![setup-grafana-prometheus-3](/images/basic-monitoring-with-grafana-n-prometheus/setup-grafana-prometheus-3.png)

Sau khi đã khởi động xong thì chúng ta sẽ vào lần lượt 2 đường dẫn để kiểm tra: `localhost:9090` cho prometheus và `localhost:3000` cho grafana.

![setup-grafana-prometheus-4](/images/basic-monitoring-with-grafana-n-prometheus/setup-grafana-prometheus-4.png)

Và khi vào Grafana thì mình sẽ được hỏi mật khẩu. Bạn chỉ cần nhập username và password là `admin` sau đó đổi mật khẩu và vào được trang home.

![setup-grafana-prometheus-5](/images/basic-monitoring-with-grafana-n-prometheus/setup-grafana-prometheus-5.png)

### Setup & run Application

> Note: vì mình đã có dự án sắn ở trong máy, nên mình sẽ thực hành ở trong thư mục khác với workspace. Bạn vẫn cứ làm như hướng dẫn là được.

Bước này thì dễ hơn, bạn chỉ cần build ứng dụng và chạy là được. Đầu tiên là vào trong mã nguồn của dự án.

Cài đặt các packages cần thiết.

```bash
npm install

# hoặc
pnpm install
```

![setup-n-run-application-1](/images/basic-monitoring-with-grafana-n-prometheus/setup-n-run-application-1.png)

Rồi build dự án từ typescript về javascript.

```bash
npm run build:express

# hoặc
pnpm run build:express
```

![setup-n-run-application-2](/images/basic-monitoring-with-grafana-n-prometheus/setup-n-run-application-2.png)

> Note: trong bài này mình chọn build với Esbuild, vì nó build dự án rất nhanh.

Sau đó thì chạy dự án.

```bash
npm run start:express

# hoặc
pnpm run start:express
```

![setup-n-run-application-3](/images/basic-monitoring-with-grafana-n-prometheus/setup-n-run-application-3.png)

> Note: bạn cũng có thể thấy là đang có client nào đó request vào trong route `/metrics`.

Vào `localhost:7800/api-docs` để mở giao diện Swagger. Bạn cũng có thể thao tác trong thư viện này để hiểu hơn về ứng dụng mà chúng ta sẽ thực hành sắp tới.

![setup-n-run-application-4](/images/basic-monitoring-with-grafana-n-prometheus/setup-n-run-application-4.png)

### Setup Jmeter

Để cho việc quan sát giống thật nhất có thể thì mình sẽ dùng Jmeter để giả lập. Nếu bạn muốn học setup Jmeter thì có thể xem video này ([https://www.youtube.com/watch?v=SoW2pBak1_Q](https://www.youtube.com/watch?v=SoW2pBak1_Q)). Mở Jmeter lên và mở file `BasicMonitoring.jmx` ở trong thư mục `tool-configs/jmeter/` mà chúng ta đã copy trước đó. Trong này thì bạn sẽ thấy mình đã setup 2 thread groups sẵn để test rồi, nên bạn sẽ không cần phải setup nữa.

![setup-jmeter-1](/images/basic-monitoring-with-grafana-n-prometheus/setup-jmeter-1.png)

![setup-jmeter-2](/images/basic-monitoring-with-grafana-n-prometheus/setup-jmeter-2.png)

Mỗi thread sẽ có 6 endpoints, mỗi endpoints sẽ có các lool controller khác nhau, dùng để random số lần tạo request tới endpoint.

### View metrics

Khi ứng dụng nodejs đã chạy rồi thì chúng ta có thể xem các metrics mà prometheus nó collect thông qua `localhost:7800/metrics`. Trong này thì có thể thấy các metrics đặc biệt khi kéo xuống cuối.

![view-metrics-1](/images/basic-monitoring-with-grafana-n-prometheus/view-metrics-1.png)

> Note: hiện tại thì mình vẫn chưa thực hiện gửi request tới các endpoints chính nên một số metrics vẫn chưa được collect, bạn có thể thử request qua Swagger để có thể có cái nhìn trực quan trước.

Chúng ta sẽ thực hiện truy vấn tới metric này trong Grafana hoặc chính giao diện của Prometheus. Vì hồi nãy chúng ta chỉ thấy `http_request_duration_seconds_bucket` là được collect, cho nên chúng ta thử truy vấn trong giao diện của Prometheus.

![view-metrics-2](/images/basic-monitoring-with-grafana-n-prometheus/view-metrics-2.png)

View theo dạng graph.

![view-metrics-3](/images/basic-monitoring-with-grafana-n-prometheus/view-metrics-3.png)

Mỗi một `_bucket` sẽ là một counter (là một trong số các loại metric của Prometheus) nên nó sẽ luôn tăng theo thời gian, nghĩa là đồ thị luôn đi lên hoặc nằm ngang => chính vì thế mà nó cũng không có quá nhiều ý nghĩa. Thường thì mình sẽ dùng thêm hàm `rate()` và chuyền metric đó dưới dạng range vector để thấy được thông tin có ý nghĩa hơn: biến động trong sự gia tăng của metric.

Giờ thì mình thử sửa lại thành query `rate(http_request_duration_seconds_bucket[1m])` (nghĩa là tốc độ tăng trung bình mỗi giây trong 1 phút gần nhất của từng http_request_duration_seconds_bucket).

![view-metrics-4](/images/basic-monitoring-with-grafana-n-prometheus/view-metrics-4.png)

### Setup Dashboard

Trước khi thêm dashboard, thì chúng ta phải setup Data source trước. Ở phần bên trái, vào giao diện của Connections qua lựa chọn `Connections` và ấn chọn `Add new connection`.

![setup-dashboard-1](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-1.png)

Tìm `prometheus` và chọn **Prometheus**.

![setup-dashboard-2](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-2.png)

Trong trang README của Prometheus, chọn tiếp `Add new data source`.

![setup-dashboard-3](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-3.png)

Và mình setup đơn giản như sau:

- Name: `prometheus`.
- Connection: url thì bạn nhập `http://prometheus:9090/`.

![setup-dashboard-4](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-4.png)

Ấn `Save & test` và khi có kết quả như này thì chúng ta đã setup xong data source.

![setup-dashboard-5](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-5.png)

Giờ thì chúng ta về lại trang Dashboard. Ở đây thì chọn `New > Import`.

![setup-dashboard-6](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-6.png)

Sau đó là ném file `sma-dashboard.json` trong `tool-configs/grafana` để tạo Dashboard.

![setup-dashboard-7](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-7.png)

![setup-dashboard-8](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-8.png)

Và đây là kết quả.

![setup-dashboard-9](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-9.png)

![setup-dashboard-10](/images/basic-monitoring-with-grafana-n-prometheus/setup-dashboard-10.png)

Hiện tại thì có một số Panel sẽ đề là chưa có data, vì Prometheus Client nó chưa có collect được các metric đó. Ở trong phần sau thì chúng ta sẽ thử chạy giả lập một tình huống, thì mới có thể thấy được rõ hơn về hiện trạng của ứng dụng.

## Review

Trước khi test kết quả, thì mình sẽ giải thích từng cái Panel.

Đầu tiên là **HTTP Concurrent Requests** panel, nó cho biết một số các route của mình có đang có nhiều connection hay không? Nhiệm vụ của panel này cho biết mỗi routes đó đang có bao nhiều request đồng thời được xử lý. Mình nghĩ chỗ này thì nên tính tổng cho toàn bộ luôn chứ không chọn ra route cụ thể. Ví dụ như trong query thì mình đang truy vấn các **metric** mà trong đó nó có label **route** có giá trị bắt đầu bằng `/sample/`.

![review-1](/images/basic-monitoring-with-grafana-n-prometheus/review-1.png)

Ở panel **HTTP Request Latency (P90)** thì cho chúng ta thông tin thú vị hơn. Biểu đồ sẽ cho chúng ta biết được tốc độ biến động của request latency => cho chúng ta biết là ứng dụng hay hệ thống có đang hoạt động ổn hay không, nếu như biểu đồ lên càng cao, thì hệ thống của mình đang càng chậm. Tại sao lại có thể khẳng định như vậy? Để có thể nắm được phần này thì mình sẽ cần phải nắm được phân vị, phân vị nghĩa là các phần dữ liệu được chia ra và quan sát bằng nhau. Ngoài ra thì chúng ta còn có **histogram**, thì loại metric này nó có nhiệm vụ là phân bổ dữ liệu thành từng phần (trong prometheus là số đếm - counter), gọi là bucket, nghĩa là metric **_bucket** mà mình đã nói trước đó sẽ liên quan tới phân vị (theo ý hiểu của mình, nếu sai thì nhắc mình nhé).

Điều này có nghĩa là tại một thời điểm T, khi có dữ liệu đi tới, thì nó có thể được phân loại vào trong 1 hoặc nhiều bucket. Ví dụ như mình có 2 buckets là `<= 0.005` và `<= 0.1`, khi có request mà latency là `0.004` thì nó sẽ rơi vào cả 2 buckets này => nếu như có nhiều buckets được gán nhãn như thế và có giá trị latency lớn hơn thì nó cũng sẽ rơi vào các bucket đó. Khi có request mà latency của nó là `0.05` thì nó sẽ chỉ rơi vào bucket `<= 0.1` và các bucket sau, không rơi vào bucket `<= 0.005`. Từ đây chúng ta sẽ dễ dàng phân hoá và tính toàn hơn (nhờ vào cách phân bổ của histogram), ví dụ ở thời điểm hiện tại, mình quan sát thấy là bucket `<= 0.005` có số đếm gần bằng bucket `<= 0.1` thì chúng ta kết luận là số các request có latency dưới 0.005 là cực nhiều, nghĩa là hệ thống của mình đang hoạt động tốt, còn con số khác biệt giữa bucket `<= 0.005` và bucket `<= 0.1` thì có nghĩa là nó là các reqeust mà có latency rơi vào từ `(0.005, 0.1]`. Giờ thì chúng ta sẽ dùng bách phân vị, chia dữ liệu thành 100 phần bằng nhau và chúng ta sẽ lấy phân vị thứ 90 (Percentile 90 - P90), nghĩa là dữ liệu tại điểm đó sẽ đảm bảo 90% số còn lại nhỏ hơn nó và 10% sẽ lớn hơn nó => Điều này có nghĩa là chúng ta sẽ mong muốn quan sát số các request mà tại đó latency của nó nhỏ hơn giá trị P90 => Vì thế mà số càng nhỏ thì sẽ có tới 90% số request có latency nhỏ hơn số đó.

Tới đây thì mình nghĩa là bạn đã có thể hiểu chúng ta dùng phân vị thứ 90 rồi, nhưng vì để quan sát được biến động của counter, thì chúng ta cần phải dùng hàm `rate` để làm việc đó, và dùng `sum` (group theo label **le** của metric **_bucket**) để có thể tính tổng toàn bộ dữ liệu được thu từ hệ thống, chính vì vậy mà chúng ta có truy vấn như trong hình.

![review-2](/images/basic-monitoring-with-grafana-n-prometheus/review-2.png)

Các panel còn lại thì mình sẽ review nhanh, vì nó cũng đơn giản, bạn có thể coi query khi edit từng cái panel một. Trong đó các panel Total sẽ là các panel tính tổng request đi tới, số các request thành công và số các request thất bại. Còn các Rate panel sẽ cho chúng ta thấy sự biến động thay đổi trong các panel total tương ứng. 

![review-3](/images/basic-monitoring-with-grafana-n-prometheus/review-3.png)

## Test result

Giờ thì mình bắt đầu thôi, vào trong Jmeter để start một Thread group lên, bạn có thể chọn bất kì thread group nào (có thể sửa luôn **Ramp-up period** để có thể kéo dài thời gian giả lập hơn). Mình sẽ chạy trong 1 phút.

![test-result-1](/images/basic-monitoring-with-grafana-n-prometheus/test-result-1.png)

Sau đó thì vào tab **View Results Tree** hoặc **View Results in Table** để xem coi là giả lập đã chạy chưa.

![test-result-2](/images/basic-monitoring-with-grafana-n-prometheus/test-result-2.png)

Chạy rồi ha, giờ thì mình trở lại Dashboard để quan sát kết quả.

![test-result-3](/images/basic-monitoring-with-grafana-n-prometheus/test-result-3.png)

![test-result-4](/images/basic-monitoring-with-grafana-n-prometheus/test-result-4.png)

Tới đây thì mình có thể đánh giá như sau, từ lúc mình mở gải lập là lúc 10:38 phút thì hệ thống hoạt động rất ổn, bằng chừng là trong panel **HTTP Request Latency (P90)** cho mình thấy là đồ thị của nó đang đi ngang, với value dưới 0.005 (5ms). Bên cạnh đó thì số requests lại còn tăng cao nữa => số requests tăng cao trong 1 phút mà tốc độ vẫn đảm bảo thì hệ thống đang hoạt động quá ổn.

Nhưng vẫn có một số lỗi diễn ra khi counter đã đếm được và cho mình thấy được sự biến động của các request lỗi luôn.

Sau khi giả lập chạy xong thì chờ một xíu nữa để xem các đồ thị của chúng ta sẽ trông như thế này:

Panel **HTTP Request Latency (P90)** thì vẫn lên xuống và đi ngang một ngưỡng giá trị thấp. 

![test-result-5](/images/basic-monitoring-with-grafana-n-prometheus/test-result-5.png)

Nhưng với các panel Total và panel Rate thì có hình dạng đặc biệt hơn. Với panel Total thì bạn có thể thấy đồ thị của chúng đi lên, xong sau đó là đi ngang; còn panel Rate thì đồ thị của chúng đi lên nhưng về sau thì lại đi xuống => như vậy các tính chất mà mình nói đã được chứng minh.

![test-result-6](/images/basic-monitoring-with-grafana-n-prometheus/test-result-6.png)

Bạn có thể chạy lại giả lập và quan sát thêm để có thể thấy một số điều thú vị nhé. Bài này thì mình thử nghiệm kết quả tới đây thôi, có thể kết luận là ứng dụng mà mình setup đã chạy thành công, hoàn thành 100% mục tiêu của bài này.

## How does prometheus collect metrics?

Vậy thì Prometheus làm thế nào để có thể thu hoạch được metrics? Bạn có thể nhìn vào sơ đồ sau:

![prometheues-workflow](/images/basic-monitoring-with-grafana-n-prometheus/prometheues-workflow.png)

Trong mã nguồn ứng dụng, ở file `src/runtimes/express/middlewares/collect-request.ts` thì bạn có thể thấy được code của nó như sau:

```ts
import {
  totalRequestCollector,
  totalRequestStatusCollector,
  concurrentRequestsCollector,
} from "src/core/monitoring";

// Import types
import type { Request, Response, NextFunction } from "express";

const excludeURLs = ["/metrics", "/health", "/api-docs", "/.well-known"];

function getRoute(req: Request) {
  return req.route ? req.route.path : req.path;
}

/**
 * Create new handler for finish event of response.
 *
 * @param req
 * @param res
 * @returns - finish event handler
 */
function createWhenFinishHandler(req: Request, res: Response) {
  const handle = function () {
    // Collect when finish
    // Collect request count
    totalRequestCollector.inc({ method: req.method, route: getRoute(req) });

    // Collect status count
    totalRequestStatusCollector.inc({ status_code: res.statusCode });

    // Decrease concurrent request
    concurrentRequestsCollector.dec({
      method: req.method,
      route: getRoute(req),
    });

    res.off("finish", handle);
  };

  return handle;
}

/**
 * Collect all requests from user, exclude urls in blacklist.
 *
 * @param req
 * @param res
 * @param next
 */
export function middleware_collectRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (excludeURLs.some((url) => req.originalUrl.startsWith(url))) {
    return next();
  }

  // Collect in the beginning of request
  // Increase concurrent request
  concurrentRequestsCollector.inc({
    method: req.method,
    route: getRoute(req),
  });

  res.on("finish", createWhenFinishHandler(req, res));

  next();
}
```

Middleware được gọi thì nó sẽ collect một số metrics sau đó subscribe handler vào finish event và sau khi requet được thực hiện xong thì nó sẽ collect hoặc update tiếp các metrics.

## Conclusion

Tới đây thì bạn đã có thể hiểu được cách để setup một ứng dụng đơn giản mà có thể quan sát và giám sát được. Trong bài này thì mình setup một số các metrics đủ để chúng ta có thể hiểu được ứng dụng cũng như là tình trạng của nó. Trong bài sau thì mình có thể setup nâng cao thêm một **chút**, đó là tích hợp thêm tính năng gửi thông báo, bằng cách là sử dụng dịch vụ AWS (có thể tích hợp với CloudWatch thử).
