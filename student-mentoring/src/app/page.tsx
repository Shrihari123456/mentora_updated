import Image from "next/image";

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <Image
        src="/next.svg"
        className="dark:bg-gray-800"
        alt="Next.js Logo"
        width={500}
        height={500}
      />
    </>
  );
}
