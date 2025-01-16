// Import styles
import "./index.css";

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex h-[calc(100dvh-52px)] items-center m-auto">
        <p className="max-w-[320px] text-3xl me-[120px]">
          <strong>Nguyen Anh Tuan</strong>, that is my name, is a{" "}
          <span className="bg-primary text-primary-foreground">curious</span>{" "}
          fullstack + cloud developer
        </p>
        <div className="relative w-[360px] aspect-square">
          <img className="absolute artwork-svg" src="/svg/temple_body-01.svg" />
          <img className="absolute artwork-svg" src="/svg/temple_head-01.svg" />
          <div className="artwork_effect w-full flex justify-center">
            <span className="dot--animate absolute"></span>
            <span className="dot absolute"></span>
          </div>
        </div>
      </div>
      <div className="flex h-[100dvh]">
        <div className="flex flex-col items-center w-full">
          <h2 className="font-bold text-2xl">Techstack</h2>
          <p>What i knew</p>
        </div>
      </div>
      <div className="flex h-[100dvh]">
        <div className="flex flex-col items-center w-full">
          <h2 className="font-bold text-2xl">Projects</h2>
          <p>What i did</p>
        </div>
        <div></div>
      </div>
      <div className="flex h-[100dvh]">
        <div className="flex flex-col items-center w-full">
          <h2 className="font-bold text-2xl">Blogs</h2>
          <p>What i wrote</p>
        </div>
      </div>
    </section>
  );
}
