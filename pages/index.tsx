import Head from 'next/head';
import styles from './index.module.scss';
import { format } from 'date-fns';

type Props = {
	sites: { name: string; url: string; vercel: string; updated: string }[];
	site: string;
};

export default function Home({ sites }: Props) {
	return (
		<>
			<Head>
				<title>bebejane sites</title>
				<meta name='description' content='desc' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main className={styles.main}>
				<ul>
					{sites.map(({ name, url, updated }, idx) => (
						<li key={idx}>
							<img src={`${url}/favicon.ico`} alt={name} />
							<a href={url} key={name} target='_blank'>
								{name}
							</a>
							<div className={styles.updated}>{format(new Date(updated), 'dd/MM/yyyy HH:mm')}</div>
						</li>
					))}
				</ul>
			</main>
		</>
	);
}

const endpoint = 'https://api.vercel.com';

const query = async (path: string, params: any = {}) => {
	Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

	const qs = Object.keys(params)
		.map((k) => `${k}=${params[k]}`)
		.join('&');
	const req = `${endpoint}${path}?${qs}`;
	const res = await fetch(req, {
		headers: { authorization: `Bearer ${process.env.API_TOKEN_VERCEL}` },
	});
	const data = await res.json();
	return data[Object.keys(data).find((k) => k !== 'pagination') as string];
};

export async function getServerSideProps() {
	const data: any[] = await query('/v9/projects', {
		teamId: process.env.TEAM_ID_VERCEL,
		limit: 100,
	});

	const sites = data
		.map((el) => ({
			name: el.name.replaceAll('-', ' '),
			url: `https://${el.targets.production?.alias[0]}`,
			vercel: `https://vercel.com/konst-och-teknik/${el.name}`,
			updated: el.updatedAt,
		}))
		.filter((el) => !el.name.includes('datocms'))
		.filter((el) => !el.name.includes('plugin'))
		.filter((el) => !el.name.includes('bebejane'));

	return {
		props: { sites },
	};
}
