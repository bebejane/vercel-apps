import Head from 'next/head'
import styles from '@/styles/Home.module.scss'

type Props = {
  sites: { name: string, url: string }[]
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
        {sites.map(({ name, url }) =>
          <a href={url} key={name}>{name}</a>
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

const aliases = async (teamId: string) => query('/v4/aliases', { teamId, limit: 100 })
const projects = async (teamId?: string) => query('/v9/projects', { teamId, limit: 100 })
const teams = async () => query('/v2/teams')

export async function getStaticProps() {

  const data: any[] = await projects(process.env.TEAM_ID_VERCEL as string)
  const dataHobby: any[] = await projects()

  const sites = data.concat(dataHobby)
    .map((el) => ({ name: el.name, url: `https://${el.targets.production?.alias[0]}` }))
    .filter((el) => !el.name.includes('datocms'))
    .filter((el) => !el.name.includes('plugin'))
    .filter((el) => !el.name.includes('bebejane'))

  return {
    props: { data, sites },
    revalidate: 30
  }
}