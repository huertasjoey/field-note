import { Link } from "react-router-dom";
import SafeImage from "../components/SafeImage";

const values = [
  { title: "Slow over fast", text: "We would rather publish one story we are proud of than ten we forget by Friday." },
  { title: "Curious by default", text: "Culture, places and ideas are all connected. We follow the threads wherever they lead." },
  { title: "Written by humans", text: "Every piece is reported, written and edited by people who care about the subject." },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">About</p>
      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
        Stories worth slowing down for
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Fieldnote is an independent editorial blog about culture, places, ideas and the small details of everyday life.
        It began as a notebook of observations and grew into a place for thoughtful writing and good photography.
      </p>

      <SafeImage
        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"
        alt="A notebook and pen on a wooden desk"
        className="mt-10 aspect-[21/9] w-full rounded-2xl object-cover"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-serif text-xl font-bold">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-line bg-white p-8 text-center">
        <h2 className="font-serif text-2xl font-bold">Join the conversation</h2>
        <p className="mt-2 text-muted">Get new stories in your inbox, or start reading right away.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/#newsletter" className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Subscribe
          </Link>
          <Link to="/#recent" className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium hover:bg-ink hover:text-white">
            Read the latest
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
