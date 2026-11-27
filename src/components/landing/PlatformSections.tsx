import { Card, CardContent } from "@/components/ui/card";
import { FEATURE_CARDS, PROBLEM_CARDS } from "./landing-content";

/** Problem-awareness and 6-card platform feature overview sections. */
export function ProblemAndFeaturesSections() {
  return (
    <>
      <section className="border-y border-[#dce5df] bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Why Static AQI Numbers Fall Short
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#10201a]">
              Air pollution changes hour by hour—and hits every household differently
            </h2>
            <p className="mt-3 text-base text-[#4b5e56]">
              A single number on a weather widget cannot tell a school parent, a cyclist, and a
              remote worker what to change today.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEM_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-[#f9fbf9]">
                  <CardContent className="p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f1e9] text-[#0d3b2e]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-[#10201a]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4b5e56]">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Actionable Intelligence Platform
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#10201a]">
              Built to turn pollution data into everyday protection and cleaner habits
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d3b2e] text-emerald-100">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-[#10201a]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4b5e56]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
