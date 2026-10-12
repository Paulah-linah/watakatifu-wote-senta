import React from 'react';
import { useParams } from 'react-router-dom';
import {
  History,
  Compass,
  Heart,
  ShieldCheck,
  TreePine,
  CheckCircle,
  Building,
  Users,
  MapPin,
  Calendar,
} from 'lucide-react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TabNav } from '@/components/common/TabNav';
import { coreValuesOf, useSiteSettings } from '@/services/content';
import { usePageMeta } from '@/lib/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

const TABS = [
  { key: 'story', label: 'Our Story (1986)', icon: History },
  { key: 'mission-vision', label: 'Mission & Vision', icon: Compass },
  { key: 'philosophy', label: 'Philosophy', icon: Heart },
  { key: 'values', label: 'Core Values', icon: ShieldCheck },
];

export const AboutPage: React.FC = () => {
  const { tab = 'story' } = useParams();
  const { settings } = useSiteSettings();
  const current = TABS.find((t) => t.key === tab);
  usePageMeta({ title: current ? `About: ${current.label}` : 'About', description: 'The history, mission, vision and values of Watakatifu Wote Senta, an institution of the Catholic Diocese of Ngong since 1986.' });
  if (!current) return <NotFoundPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <SectionHeader
        level={1}
        badge="About Watakatifu Wote Senta"
        title="Our Institutional Identity & Catholic Heritage"
        subtitle="Serving the Diocese of Ngong and the broader community with pastoral dedication, peace, and professional hospitality since 1986."
      />

      <TabNav basePath="/about" items={TABS} active={tab} label="About sections" />

      {/* Tab 1: Our Story */}
      {tab === 'story' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E3DAC9] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded">
                <Calendar className="w-3.5 h-3.5" />
                <span>Founded 1 November 1986</span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-stone-900">
                Four Decades of Grace, Community & Hospitality
              </h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Watakatifu Wote Senta (Swahili for <em>All Saints Centre</em>) was officially opened on <strong>1 November 1986</strong>, on the liturgical Feast of All Saints, as a spiritual and hospitality facility under the Catholic Diocese of Ngong.
              </p>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Established to serve both Diocesan and non-Diocesan groups, the centre has welcomed Catholic parish councils, clergy, religious congregations, non-Catholic Christian communities, civil society organizations, and government delegations across Kenya.
              </p>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Our peaceful campus along Kahara Road in Ngong features three main conference facilities (St. Bakhita, St. Julian, St. Bernard), residential wings with historical capacity reaching 62 beds, six self-contained guest apartments, an outdoor amphitheatre, and a consecrated daily Mass chapel.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80"
                  alt="Watakatifu Wote Chapel and grounds"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Diocese Context Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
              <Building className="w-4 h-4" />
              <span>Catholic Diocese of Ngong Context</span>
            </div>
            <h4 className="font-serif text-2xl font-bold text-stone-900 mb-3">
              Serving Kajiado and Narok Counties
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              The Catholic Diocese of Ngong encompasses extensive pastoral territory across both <strong>Kajiado and Narok Counties</strong>, comprising <strong>44 parishes structured across seven distinct deaneries</strong>. Watakatifu Wote Senta acts as a central spiritual heart and logistical hub for diocesan synods, ongoing clergy formation, catechist certification, and parish leadership gatherings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-serif text-2xl font-bold text-sky-800">44 Parishes</div>
                <div className="text-xs text-stone-500 mt-1">Active communities of faith</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-serif text-2xl font-bold text-sky-800">7 Deaneries</div>
                <div className="text-xs text-stone-500 mt-1">Pastoral administrative zones</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-serif text-2xl font-bold text-sky-800">2 Counties</div>
                <div className="text-xs text-stone-500 mt-1">Kajiado & Narok counties</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mission & Vision */}
      {tab === 'mission-vision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                Our Shared Destination
              </span>
              <h3 className="font-serif text-3xl font-bold text-stone-900">
                Vision Statement
              </h3>
              <blockquote className="font-serif text-2xl text-stone-800 italic border-l-4 border-sky-600 pl-4 py-2 leading-relaxed">
                &ldquo;{settings.vision}&rdquo;
              </blockquote>
              <p className="text-sm text-stone-600 leading-relaxed">
                We envision an all-inclusive human and spiritual communion where individuals, families, religious, and institutional visitors experience spiritual peace and human fulfillment in Christ.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Our Purpose in Action
              </span>
              <h3 className="font-serif text-3xl font-bold text-stone-900">
                Mission Statement
              </h3>
              <blockquote className="font-serif text-2xl text-stone-800 italic border-l-4 border-amber-500 pl-4 py-2 leading-relaxed">
                &ldquo;{settings.mission}&rdquo;
              </blockquote>
              <p className="text-sm text-stone-600 leading-relaxed">
                Realized through the proclamation of the Gospel, diligent pastoral accompaniment, professional conference hospitality, and sustainable socio-economic development initiatives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Philosophy */}
      {tab === 'philosophy' && (
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#E3DAC9] animate-in fade-in duration-200">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded">
              Ecclesial Foundation
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Philosophy of Service & Creation
            </h3>
            <p className="font-serif text-xl sm:text-2xl text-stone-800 italic border-l-4 border-emerald-600 pl-4 py-2">
              &ldquo;{settings.philosophy}&rdquo;
            </p>
            <div className="space-y-4 text-sm sm:text-base text-stone-600 leading-relaxed pt-2">
              <p>
                At Watakatifu Wote Senta, our operational work is fundamentally viewed through the lens of Catholic stewardship. We believe that:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Sanctity of Human Life:</strong> Every visitor, delegate, and retreatant is received as a person made in the image and likeness of God, entitled to dignity, comfort, and restorative quiet.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Care for Creation (Laudato Si’):</strong> Our landscaped gardens and grounds in Ngong are maintained as an eco-sanctuary supporting reflection, fresh air, and biodiversity.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Service to Humanity as Service to God:</strong> Hospitality is not treated merely as a commercial transaction, but as a Gospel calling of welcoming the stranger.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Core Values */}
      {tab === 'values' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValuesOf(settings).map((val, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 font-bold flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <h4 className="font-serif text-xl font-bold text-stone-900 mb-2">
                  {val.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
};
