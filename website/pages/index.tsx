import React from "react";
import Head from "next/head";
import Menu from "../components/Menu";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>@rkusa/use-menu</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section role="main">
        <div className="flex items-center justify-center p-16">
          <Menu />
        </div>
      </section>
    </>
  );
}
