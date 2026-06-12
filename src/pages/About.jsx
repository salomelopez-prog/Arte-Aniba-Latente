import { motion } from 'framer-motion'
import { Award, Hammer, HeartHandshake, Leaf, Trees, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { settingsApi } from '../api/client.js'
import { DEFAULT_ABOUT, mergeAbout, safeParse } from '../data/siteContent.js'

// Iconos fijos para los pasos del proceso (la dueña edita el texto, no el icono).
const stepIcons = [Trees, Hammer, Leaf, HeartHandshake]

const About = () => {
  const [content, setContent] = useState(DEFAULT_ABOUT)

  useEffect(() => {
    settingsApi
      .getAll()
      .then((d) => {
        const saved = safeParse(d.settings?.about_content, null)
        setContent(mergeAbout(saved))
      })
      .catch(() => setContent(DEFAULT_ABOUT))
  }, [])

  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="dark-shell relative overflow-hidden rounded-[3rem] p-7 text-clay-bg shadow-2xl shadow-night/20 md:p-10"
        >
          <div className="absolute inset-0 grain-layer opacity-30" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-clay-soft">{content.eyebrow}</p>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.9] tracking-[-0.05em] md:text-8xl">
              {content.title}
            </h1>
            {content.history.map((para, i) => (
              <p key={i} className={`${i === 0 ? 'mt-8 text-xl text-clay-bg/70' : 'mt-4 text-lg text-clay-bg/58'} whitespace-pre-line leading-8`}>
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-5">
          <p className="whitespace-pre-line text-xl leading-8 text-carbon/68">{content.lead}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.stats.map((stat, i) => (
              <div key={i} className="artisan-card rounded-[2rem] p-6">
                <p className="font-display text-5xl font-semibold text-clay">{stat.value}</p>
                <p className="mt-2 font-bold text-carbon">{stat.label}</p>
                <p className="mt-2 text-carbon/62">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">{content.processEyebrow}</p>
            <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight text-carbon md:text-6xl">{content.processTitle}</h2>
          </div>
          <div className="flex items-center gap-3 text-carbon/62">
            <Users className="h-5 w-5" />
            <span className="text-sm font-bold">Equipo: 3 administrativos + 1 operario + 6 indirectos</span>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {content.steps.map((step, index) => {
            const Icon = stepIcons[index % stepIcons.length]
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                className="artisan-card rounded-[2rem] p-6 transition hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-clay-bg">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold text-carbon">{step.title}</h3>
                <p className="mt-3 whitespace-pre-line leading-7 text-carbon/64">{step.text}</p>
                {step.detail ? <p className="mt-3 text-sm font-bold text-clay">{step.detail}</p> : null}
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="artisan-card rounded-[3rem] p-8 md:p-12">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8 text-clay" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Propuesta de valor</p>
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-carbon md:text-5xl">
            {content.valueTitle}
          </h2>
          {content.value.map((para, i) => (
            <p key={i} className={`${i === 0 ? 'mt-5 text-xl text-carbon/66' : 'mt-4 text-lg text-carbon/54'} max-w-3xl whitespace-pre-line leading-8`}>
              {para}
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
