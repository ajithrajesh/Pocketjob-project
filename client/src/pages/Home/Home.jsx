import Hero from "../../components/layout/Hero/Hero";
import Categories from "../../components/layout/Categories/Categories";
import FeaturedJobs from "../../components/layout/FeaturedJobs/FeaturedJobs";
import WhyChoose from "../../components/layout/WhyChoose/WhyChoose";
import HowItWorks from "../../components/layout/HowItWorks/HowItWorks";

import "./Home.css";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedJobs />
      <WhyChoose />
      <HowItWorks />
    </>
  );
}

export default Home;