# Introduction

Trong bài viết này thì mình sẽ nói về cái pattern (mẫu thiết kế) mà mình mới học được và áp dụng nó để làm một ứng dụng mẫu đơn giản.

## About

Trong khi làm Tnditor, thì mình có tham khảo về một vài ví dụ ráp **Plugin** cho các tính năng trong **Editor** của **Lexical** (một Rich Text Editor open source của Meta) và từ đó nảy ra được ý tưởng về cách viết ứng dụng React khá hay ho. Có thể mình sẽ áp dụng kỹ thuật này cho các dự án viết bằng React (hoặc bất kì công nghệ nào) sắp tới.

Vậy thì cái pattern trong bài này mình đang nói tới là gì? Thực chất message-driven pattern nó là event-driven pattern, là một kỹ thuật khá phổ biến trong xây dựng hệ thống backend, nói đơn giản thì nó sẽ có 2 thành phần: 1 là event emitter và event listener, **emitter** (producer) sẽ chịu trách nhiệm gửi một message nào đó về cho **router/broker** và **listener** (consumer) sẽ nhận lại sự kiện đó và thực hiện hành động đã được định nghĩa trước, thì đó là ý tưởng cơ bản về event-driven pattern.s

> Message sẽ bao gồm tên message (để router/broker phân biệt và chuyển tới listener tương ứng) và payload (dữ liệu để listener xử lý).

Event-driven pattern nó là mở rộng của Observer pattern, trong khi Observer pattern được áp dụng ở tầng ứng dụng (application) thì EDP nó sẽ được mở rộng và áp dụng ở trong tầng hệ thống (system). Nên trong ứng dụng của mình, thì mình sẽ xây dựng một đối tượng mà tại đó nó sẽ giữ 2 thành phần quan trọng nhất: listeners map và message queue.

> Observer pattern cũng được áp dụng trong React.

## Idea

Để áp dụng được observer pattern trong nó thì mình sẽ cần phải:

- Xây dựng core code cho pattern, mình sẽ chỉ có một object trong core code, gọi là **Processor**. Từ processor này, mình có thể áp dụng được cho nhiều object khác nhau ở trong ứng dụng.
- Dùng **useEffect** (react hook): hook này cho phép mình có thể dùng để thực hiện một số hành động side-effect (hành động bên ngoài react component) => nơi thích hợp để register/subcribe listener, vì về cơ bản, Processor được viết dưới dạng Javascript thuần, không hướng về bất kì thư viện, framework nào (trung lập).

Từ kinh nghiệm và kiến thức của mình thì ứng dụng cơ bản sẽ có 2 phần quan trọng nhất: **GUI** (Giao diện đồ hoạ người dùng) và **State of Data** (Trạng thái dữ liệu). Khi người dùng thao tác với ứng dụng, thì sẽ có thể có một hoặc nhiều sự kiện gì đó diễn ra (_Người dùng ấn nút xem trang cá nhân => Kích hoạt sự kiện tải thông tin cá nhân; Người dùng ấn vào nút thanh toán => Kích hoạt sự kiện tạo giao dịch thanh toán, ..._); Bản thân của ứng dụng có thể có giữ một số phần dữ liệu tĩnh và động => Dữ liệu động sẽ có trạng thái, luôn thay đổi theo thời gian hoặc thay đổi theo sự kiện, cho nên việc quản lý và lưu trữ state của ứng dụng rất quan trọng.

Trong ứng dụng này thì mình sẽ cũng thực hiện làm các tính năng quản lý người dùng theo dạng plugin, có thể thêm hoặc bỏ đi tuỳ thích, giống với ý tưởng thêm tính năng cho Editor của Lexical.

Những phần ý tưởng ở trên mình đã liệt kê ra thì khá quan trọng, nó sẽ củng cố cho mình trong việc xây dựng Processor (Core code) và kết hợp nó nhuần nhuyễn với nền tảng (React Hook).

## Implement the observer pattern

Ok, hy vọng tới đây bạn đã có thể nắm được ý tưởng của mình, giờ thì bắt tay vào làm thôi. Bạn có thể truy cập vào Stackbliz mình để ở cuối bài để có thể xem code kỹ hơn.

### Command, Message & Processor

Trước khi đi sâu vào từng thành phần thì mình sẽ giải thích qua cách mà từng thành phần được cấu thành và sử dụng trong Core.

![how-does-it-work_ewurjt](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771416572/portfolio/blogs/message-driven-pattern-react-app/how-does-it-work_ewurjt.png)

Đây chính là ý tưởng cốt lõi của phần Core.

#### Command

Command sẽ là thành phần được dùng để định danh cho một hành động / event listener nào đó. Processor sẽ biết được là nó nên lấy listener nào ra để thực hiện yêu cầu được gửi từ người dùng.

```ts
export class Command {
  public id: string;
  public name?: string;
  public onComplete?: () => void;
  public onError?: (reason?: string) => void;

  constructor(name?: string) {
    this.id = nanoid();
    this.name = name;
  }

  public setOnCompleteHandler(onComplete: () => void) {
    this.onComplete = onComplete;
    return this;
  }

  public setOnErrorHandler(onError: (reason?: string) => void) {
    this.onError = onError;
    return this;
  }
}
```

Mỗi một Command khi được tạo ra thì sẽ bắt buộc có ID. Thuộc tính `name` sẽ dùng cho việc debug. Ngoài ra còn 2 phương thức `onComplete` và `onError` sẽ lần lượt được chạy khi listener chạy xong hoặc có lỗi trong quá trình listener được chạy.

=> Khi ứng dụng của mình có tính năng A, B, C thì mình sẽ cần phải tạo command cho các tính năng đó.

#### Message

Message sẽ được tạo ra mỗi khi người dùng thao tác một tính năng nào đó, nó giống như một tín hiệu giao tiếp giữa User & UI với Processor.

```ts
export type TMessage = {
  command: Command;
  payload?: any;
};
```

Chính vì thế mà Message sẽ có 2 thành phần là command và payload. **Command** đóng vai trò là "thực hiện cái A" còn **payload** thì là "thông tin thêm khi thực hiện A".

#### Processor

Như đã để cập ở phần trước, thì Processor sẽ là trung tâm xử lý các yêu cầu được gửi từ người dùng qua giao diện, nên nó sẽ có một số thuộc tính như sau:

```ts
export class Processor<S = any> {
  protected msgQueue: Array<TMessage>;
  protected listenersById: Map<string, Listener | null>;
  protected stateSetter: StateSetter<S>;
  protected stateGetter: StateGetter<S>;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(stateGetter: StateGetter<S>, stateSetter: StateSetter<S>) {
    this.listenersById = new Map();
    this.msgQueue = [];
    this.stateGetter = stateGetter;
    this.stateSetter = stateSetter;
  }

  // Other methods
  // ...
}
```

Trong đó:

- `msgQueue`: là một hàng đợi dùng để chứa các message.
- `listenersById`: là nơi lưu trữ các listener, được ánh xạ theo ID của Command. Processor sẽ biết được Listener nào nên được dùng thông qua việc ánh xạ này.
- `stateSetter` & `stateGetter`: lần lượt là hàm chỉnh sửa và lấy state của ứng dụng. Như mình đã đề cập trước đó, state rất quan trọng và Processor sẽ trung tính (không áp dụng riêng cho bất kì framework nào), nên mình sẽ cần phải có phần này ở trong Processor (bạn có thể hiểu nó giống API và Processor sẽ dùng nó).
- `timer`: lưu ID của setTimeout, khi một message được lưu vào trong Queue, thì ngay lập tức `run` sẽ được thực thi, nhưng sẽ có khả năng nhiều Message được gửi về cùng lúc và `run` được chạy nhiều lần => ảnh hưởng tới hiệu năng, nên mình sẽ quay về ý tưởng "gửi nhiều lần nhưng thực hiện một lần".

Processor cũng sẽ chịu trách nhiệm 3 việc chính:

- Xử lý các message trong Queue qua phương thức `run`.
- Để biết được Listener nào được dùng khi message được gửi về thì phải Register / Subcribe các listener với command qua phương thức `registerListener`.
- Để một thành phần nào đó trong App có thể gửi message thì phải có phương thức `sendMessage`.

```ts
// Mình sẽ chú thích từng bước trong code.
Processor.prototype.run = function() {
  let msg = this.msgQueue.shift();
  while (msg) {
    try {
      // Lấy listener theo command.id
      const listener = this.listenersById.get(msg.command.id);

      // Nếu không có thì ném lỗi.
      if (!listener)
        throw new Error(
          `Cannot find listener for the command [${msg.command.name || "Unknown"}] (id: ${msg.command.id})`,
        );

      // Chạy thử listener và trả về kết quả.
      // Nếu như có kết quả thì mình mới chỉnh lại state,
      // còn không thì sẽ không làm gì, để tránh state bị mất
      // hoặc undefined.
      // Ngoài ra thì listener còn được truyền 2 tham số, state
      // và payload của message.
      let newData = listener(this.stateGetter(), msg.payload);
      if (newData) {
        this.stateSetter(newData);
      }

      // Sau khi chạy xong listener thì sẽ chạy onComplete (nếu có)
      if (msg.command.onComplete) {
        msg.command.onComplete();
      }
    } catch (error: any) {
      // Lỗi trong quá trình chạy sẽ được catch ở đây,
      // khi đó hàm onError sẽ được chạy (nếu có).
      if (msg.command.onError) {
        msg.command.onError(error.message);
      }
    }

    msg = this.msgQueue.shift();
  }
}

// Khi register một listener, thì sẽ cần tới command.id và listener đó.
// Hàm này sẽ trả về một hàm unregisterListener, hàm unregister này khá
// quan trọng, bỏi vì nó sẽ được dùng để huỷ listener khi không cần tới
// nữa.
Processor.prototype.registerListener = function(cmd: Command, listener: Listener<S>) {
  this.listenersById.set(cmd.id, listener);

  let that = this;

  return function () {
    that.listenersById.set(cmd.id, null);
  };
}

// Khi gửi một message, thì message sẽ được push vào trong queue, sau đó
// nếu như có timer thì clear đi, chưa có thì set một timeout mới, trong
// callback của timeout này thì hàm `run` sẽ được chạy.
Processor.prototype.sendMessage = function(cmd: Command, payload?: any) {
  this.msgQueue.push({ command: cmd, payload });

  if (this.timer) clearTimeout(this.timer);
  let that = this;
  this.timer = setTimeout(() => {
    that.run();
  }, 0);
}
```

Logic của nó cũng khá đơn giản thôi đúng không.

Và mình nên có thêm một phương thức tĩnh để hỗ trợ tạo command.

```ts
Processor.createCommand(params?: TCreateCommandParams) {
  const name = (params && params.name) || "";
  const cmd = new Command(name);

  if (params && params.onComplete) {
    cmd.setOnCompleteHandler(params.onComplete);
  }

  if (params && params.onError) {
    cmd.setOnErrorHandler(params.onError);
  }

  return cmd;
}
```

Ok, như vậy là xong phần Core.

### Extend Processor for User Processor

Trong phần này thì mình sẽ làm 2 việc chính: tạo store cho state của user management và tạo User Processor. State manageer thì mình sẽ dùng Zustand, gọn nhẹ.

```ts
import { create } from "zustand";

import { Processor } from "@/modules/processor";

// Import types
import type { TUser } from "./model";

export type TUserModuleState = {
  users: TUser[];
  _users: TUser[];
};

export const useUserModuleState = create<TUserModuleState>(() => {
  return {
    users: [],
    _users: [],
  };
});

class UserProcessor extends Processor<TUserModuleState> {}

export const userProcessor = new UserProcessor(
  useUserModuleState.getState,
  useUserModuleState.setState,
);
```

Khá đơn giản thôi, chỉ cần định nghĩa các thuộc tính trong state, sau đó là subcribe **StateSetter** và **StateGetter** từ zustand hook cho User Processor (được extend từ Processor). Cái hay của nó là bạn sẽ chưa cần quan tâm tới các logic thao tác state, mình sẽ làm nó ở trong phần sau, đồng thời tách biệt được thuộc tính và phương thức cho state.

### User Management Feature

Trong phần này mình sẽ làm các tính năng:

- Load users.
- Edit user.
- Add user.
- Delete user.
- Filter users (bao gồm lọc theo trạng thái hoạt động, sắp xếp theo tên, tuổi và email).

> Mình sẽ không tập chung vào làm giao diện quản lý. Nếu bạn muốn thì có thể xem code.

#### Create an example command and listener

Đầu tiên thì mình sẽ tạo ra một Command và Listener mẫu của nó trước. Để có thể tạo được, thì mình sẽ cần có `useEffect` từ react, `Processor` từ core. Sau đó thì mình sẽ cần phải viết như một component React bình thường, nhưng component này sẽ trả về `null`. Cụ thể như sau:

```tsx
import { useEffect } from "react";

// Import modules
import { Processor } from "@/modules/processor";

export const EXAMPLE_COMMAND = Processor.createCommand();

export default function Example() {
  useEffect(() => {
    return exampleProcessor.registerListener(EXAMPLE_COMMAND, (state, payload) => {
      console.log("State:", state);
      console.log("Payload:", payload);

      return { ...state };
    });
  }, []);

  return null;
}
```

> Note 1: Command được tạo trong file và nó sẽ được export ra để có thể dùng ở chỗ khác.

> Note 2: Mình sẽ ví dụ 2 features thôi, các features còn lại thì bạn có thể vào trong code của mình để xem thêm.

#### Load Users

Giờ thì tạo một component để load users trước.

```tsx
import { useEffect } from "react";

// Import modules
import { Processor } from "@/modules/processor";
import { userProcessor } from "@/modules/user/processor";
import { useUsersQuery } from "@/modules/user";

export const LOAD_USERS_COMMAND = Processor.createCommand();

export default function LoadUsersFeature() {
  const { data: users } = useUsersQuery();

  useEffect(() => {
    return userProcessor.registerListener(LOAD_USERS_COMMAND, (state) => {
      if (!users) return state;

      if (state.users) {
        state.users.push(...users);
      } else {
        state.users = users;
      }

      const newUsers = [...state.users];

      return {
        ...state,
        users: newUsers,
        _users: newUsers,
      };
    });
  }, [users, users?.length]);

  return null;
}
```

Giả sử nếu sau này mình muốn load thêm user một cách chủ động, thì mình cùng có thể tạo thêm command và thêm một listener nữa để làm việc đó.

#### Filter Users

Và cuối cùng là filter users.

```tsx
import { useEffect } from "react";
import { toast } from "sonner";

// Import modules
import { Processor } from "@/modules/processor";
import { userProcessor } from "@/modules/user/processor";

// Import helpers / utils
import { updateAt } from "@/utils/list";

export const FILTER_USER_COMMAND = Processor.createCommand({
  onComplete() {
    toast.success("Filter users successfully");
  },
  onError(reason) {
    if (reason) toast.error(reason);
    else toast.error("Cannot filter users :(");
  },
});

export default function FilterUsersFeature() {
  useEffect(() => {
    return userProcessor.registerListener(
      FILTER_USER_COMMAND,
      (state, filter) => {
        let users: any = [];

        if (filter.activeStatus) {
          if (filter.activeStatus === "default") {
            users = state._users;
          }

          if (filter.activeStatus === "active") {
            users = state._users.filter((u) => u.isActive === true);
          }

          if (filter.activeStatus === "inactive") {
            users = state._users.filter((u) => u.isActive === false);
          }
        }

        if (filter.sort) {
          if (filter.sort.value === "default") {
            users = state._users;
          }

          // Name sort
          if (filter.sort.target === "name" && filter.sort.value === "asc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.name) return -1;
              if (!u2.name) return 1;
              return u1.name.localeCompare(u2.name);
            });
          }

          if (filter.sort.target === "name" && filter.sort.value === "desc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.name) return 1;
              if (!u2.name) return -1;
              return u2.name.localeCompare(u1.name);
            });
          }

          // Email sort
          if (filter.sort.target === "email" && filter.sort.value === "asc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.email) return -1;
              if (!u2.email) return 1;
              return u1.email.localeCompare(u2.email);
            });
          }

          if (filter.sort.target === "email" && filter.sort.value === "desc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.email) return 1;
              if (!u2.email) return -1;
              return u2.email.localeCompare(u1.email);
            });
          }

          // Age sort
          if (filter.sort.target === "age" && filter.sort.value === "asc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.age) return -1;
              if (!u2.age) return 1;
              return u1.age - u2.age;
            });
          }

          if (filter.sort.target === "age" && filter.sort.value === "desc") {
            users = [...state.users].sort((u1, u2) => {
              if (!u1.age) return 1;
              if (!u2.age) return -1;
              return u2.age - u1.age;
            });
          }
        }

        return {
          ...state,
          users,
        };
      },
    );
  }, []);

  return null;
}
```

Việc tạo các tính năng nó chỉ cơ bản như thế thôi. Giờ thì mình thử ráp lại toàn bộ để coi có hoạt động như lý thuyết không...

### Complete Application

Import tất cả các component trên vào trong component chính.

```tsx
// Another imports
// ...

// Import features
import LoadUsersFeature, { LOAD_USERS_COMMAND } from "./features/load-users";
import EditUserFeature from "./features/edit-user";
import AddUserFeature, { ADD_USER_COMMAND } from "./features/add-user";
import DeleteUserFeature from "./features/delete-user";
import FilterUsersFeature from "./features/filter-users";

// Import modules
import { userProcessor, useUserModuleState } from "@/modules/user";

export default function UserManagementPage() {
  const { users } = useUserModuleState();

  useEffect(() => {
    // Mình phải để cho việc gọi message là bất đồng bộ vì
    // listener của load user sẽ cần phải được gán trong component.
    const timeout = setTimeout(() => {
      userProcessor.sendMessage(LOAD_USERS_COMMAND);
    }, 0);

    // Và cũng phải clear timeout, tránh gọi 2 lần (hành vi bình thường
    // của React).
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/** GUI Code, Logic **/}
      <>
        <LoadUsersFeature />
        <EditUserFeature />
        <AddUserFeature />
        <DeleteUserFeature />
        <FilterUsersFeature />
      </>
      <div className="flex flex-col gap-3">
        {/** GUI Code, Logic **/}
      </div>
    </>
  );
}
```

## Demo

Ok, thì đây là kết quả. Đầu tiên thì bạn có thể thấy được giao diện quản lý sẽ trông như thế này.

![demo_1_qwplx9](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414793/portfolio/blogs/message-driven-pattern-react-app/demo_1_qwplx9.png)

Thử thêm một user mới coi như thế nào.

![demo_2_x5qiwx](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414793/portfolio/blogs/message-driven-pattern-react-app/demo_2_x5qiwx.png)

Bạn có thể thấy là (1) thanh thông báo sẽ được hiện lên; (2) user mới đã được thêm vào trong table. Điều này có nghĩa là tính năng đã hoạt động bình thường.

![demo_3_fbc9nr](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414794/portfolio/blogs/message-driven-pattern-react-app/demo_3_fbc9nr.png)

Thử cho toàn bộ user inactive hết, trừ user mình mới thêm.

![demo_4_n0zoo8](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414794/portfolio/blogs/message-driven-pattern-react-app/demo_4_n0zoo8.png)

![demo_5_nzxuv8](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414794/portfolio/blogs/message-driven-pattern-react-app/demo_5_nzxuv8.png)

Thử xoá các users có tên tiếng Việt và kết quả (bạn muốn kiểm tra kết quả thì so với các ảnh trước nhá).

![demo_6_zcfw8g](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414793/portfolio/blogs/message-driven-pattern-react-app/demo_6_zcfw8g.png)

Thử filter các user inactive.

![demo_7_a8sek2](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414794/portfolio/blogs/message-driven-pattern-react-app/demo_7_a8sek2.png)

Sort tuổi giảm dần.

![demo_8_l8d30d](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414794/portfolio/blogs/message-driven-pattern-react-app/demo_8_l8d30d.png)

Tới đây thì có thể kết luận được là ứng dụng của mình đã hoạt động khá tốt (mặc dù chưa test). Điều này cũng có nghĩa là mớ lý thuyết và ý tưởng mà mình đề ra đã hoạt động.

Thử xoá delete feature xem nó báo gì (đúng thì nó sẽ báo lỗi) và kết quả như sau:

![demo_9_tzktk5](http://res.cloudinary.com/dhqgfphiy/image/upload/v1771414795/portfolio/blogs/message-driven-pattern-react-app/demo_9_tzktk5.png)

## Conclusion

Nếu như bạn có dùng qua Redux, thì khái niệm này nó khá giống với Redux Reducer, nó cùng là một tập hợp các logic xử lý một message nào đó, trong đó nó cũng bao gồm luôn cả payload. Nhưng với kỹ thuật mình dùng trong app này nó khác, có một số điểm nổi bật về kỹ thuật này như:

- Không có reducer, chỉ có listener và processor (router/broker).
- Processor không biết logic của listener, tách biệt với state.
- Thân thiện với các React Developer, vì listener được quản lý cùng với lifecycle của component, nên một mặt nào đó nó cũng khá thân thiện với hệ sinh thái của React.
- Trừu tượng hoá State Manager, Processor không quan tâm tới SM dùng công nghệ nào, nó chỉ cần biết **State Setter và Getter**.
- Dễ mở rộng, thêm bới các tính năng. Hoặc bớt các tính năng.
- Mã nguồn linh hoạt và dễ quản lý hơn.

Bạn có thể thao tác trực tiếp ở đây: [https://stackblitz.com/~/github.com/NguyenAnhTuan1912/message-driven-react-example](https://stackblitz.com/~/github.com/NguyenAnhTuan1912/message-driven-react-example)

Hoặc có thể xem ở đây: [https://www.youtube.com/watch?v=CgRLPvqnBX8](https://www.youtube.com/watch?v=CgRLPvqnBX8)
