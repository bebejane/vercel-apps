import Head from 'next/head'
import styles from '@/styles/Home.module.scss'

type Props = {
  sites: { name: string, url: string, vercel: string }[]
  site: string
}

export default function Home({ sites }: Props) {

  return (
    <>
      <Head>
        <title>bebejane sites</title>
        <meta name="description" content="desc" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {sites.map(({ name, url, vercel }, idx) =>
          <div key={idx}>
            <a href={url} key={name} target="_blank">{name}</a>
            <a className={styles.vercel} href={vercel} target="_blank">V</a>
          </div>
        )}
      </main>
    </>
  )
}

const endpoint = 'https://api.vercel.com'

const query = async (path: string, params: any = {}) => {

  Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

  const qs = Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
  const req = `${endpoint}${path}?${qs}`
  const res = await fetch(req, { headers: { 'authorization': `Bearer ${process.env.API_TOKEN_VERCEL}` } })
  const data = await res.json()
  return data[Object.keys(data).find(k => k !== 'pagination') as string]

}

export async function getStaticProps() {

  const data: any[] = await query('/v9/projects', { teamId: process.env.TEAM_ID_VERCEL, limit: 100 })

  const sites = data
    .map((el) => ({
      name: el.name.replaceAll('-', ' '),
      url: `https://${el.targets.production?.alias[0]}`,
      vercel: `https://vercel.com/konst-och-teknik/${el.name}`,
    }))
    .filter((el) => !el.name.includes('datocms'))
    .filter((el) => !el.name.includes('plugin'))
    .filter((el) => !el.name.includes('bebejane'))


  return {
    props: { sites },
    revalidate: 10
  }
}