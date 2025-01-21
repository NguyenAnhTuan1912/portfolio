// Import states
import { useContactsState } from "src/states/contact";

// Import types
import type { ContactType } from "src/objects/contact/type";

function Contact({ data }: { data: ContactType }) {
  return (
    <div className="flex justify-between items-center">
      <p>{data.name}:</p>
      <a className="hover:underline" target="_blank" href={data.url}>
        click here
      </a>
    </div>
  );
}

export default function ContactPage() {
  const { contactStacks } = useContactsState();

  return (
    <section className="flex-1">
      <div className="flex flex-col items-center justify-center mb-6 px-3">
        <h1 className="text-3xl font-bold my-3">My information</h1>
        <p>
          If you want to know more about me, you can go to these link to get
          more information.
        </p>
      </div>
      <div className="flex flex-col max-w-[1280px] w-full mx-auto px-3">
        {contactStacks ? (
          contactStacks.map((contactStack) => (
            <div
              key={contactStack.value}
              className="w-full max-w-[480px] mb-3 mx-auto"
            >
              <h2
                key={contactStack.value}
                className="font-bold text-center text-2xl"
              >
                {contactStack.name}
              </h2>
              <div>
                {contactStack.data.map((contact) => (
                  <Contact key={contact.id} data={contact} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="flex flex-col items-center">
        <p>Or you can contact me via this gmail</p>
        <p className="font-bold">nguyenanhtuan19122002@gmail.com</p>
      </div>
    </section>
  );
}
