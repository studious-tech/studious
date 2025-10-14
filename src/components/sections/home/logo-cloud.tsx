import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

export default function LogoCloud() {
  return (
    <section className="bg-background overflow-hidden py-16">
      <div className="group relative m-auto max-w-7xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Trusted by test takers worldwide</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  PTE
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  IELTS
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  TOEFL
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  UCT
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  NEET
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  JEE
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  MCAT
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                  GRE
                </div>
              </div>
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
