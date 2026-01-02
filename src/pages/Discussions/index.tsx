import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./Discussions.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";

type Discussion = {
  title: string;
  source: string;
  category: string;
  summary: string;
  link: string;
};

type FetchState = {
  items: Discussion[];
  error: string | null;
};

const mapHackerNews = (hits: any[]): Discussion[] =>
  hits
    .filter((hit) => hit?.title)
    .map((hit) => ({
      title: hit.title as string,
      source: "Hacker News",
      category: "Engineering",
      summary:
        (hit._highlightResult?.title?.value as string | undefined) ??
        "Trending on Hacker News",
      link:
        (hit.url as string | null) ||
        `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));

const mapDevTo = (articles: any[]): Discussion[] =>
  articles.map((article) => ({
    title: article.title as string,
    source: "Dev.to",
    category: "Dev/Frameworks",
    summary:
      (article.description as string | undefined) ??
      "Frameworks, tips, and community threads.",
    link: (article.url as string) ?? "https://dev.to",
  }));

const mapReddit = (posts: any[]): Discussion[] =>
  posts.map((post) => ({
    title: post.data?.title as string,
    source: "Reddit r/programming",
    category: "General",
    summary:
      (post.data?.selftext?.slice(0, 140) as string | undefined) ||
      "Popular in r/programming",
    link: post.data?.url || `https://reddit.com${post.data?.permalink}`,
  }));

export default function Discussions() {
  const [state, setState] = useState<FetchState>({ items: [], error: null });
  const [hasLoaded, setHasLoaded] = useState(false);
  const { withLoader } = useLoader();

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const [hnRes, devtoRes, redditRes] = await Promise.allSettled([
          fetch("https://hn.algolia.com/api/v1/search?tags=front_page"),
          fetch("https://dev.to/api/articles?per_page=12&top=7"),
          fetch("https://www.reddit.com/r/programming/top.json?limit=12&t=day"),
        ]);

        const hnData =
          hnRes.status === "fulfilled"
            ? ((await hnRes.value.json()) as { hits?: any[] })
            : { hits: [] };
        const devtoData =
          devtoRes.status === "fulfilled"
            ? ((await devtoRes.value.json()) as any[])
            : [];
        const redditData =
          redditRes.status === "fulfilled"
            ? (((await redditRes.value.json()) as any)?.data?.children as any[])
            : [];

        const combined = [
          ...mapHackerNews(hnData.hits ?? []),
          ...mapDevTo(devtoData ?? []),
          ...mapReddit(redditData ?? []),
        ].filter((item) => item.title && item.link);

        if (!isMounted) return;
        setState({
          items: combined.slice(0, 24),
          error: null,
        });
      } catch (error) {
        console.error("Failed to load discussions", error);
        if (!isMounted) return;
        setState({
          items: [],
          error: "Could not load discussions right now.",
        });
      } finally {
        if (isMounted) {
          setHasLoaded(true);
        }
      }
    };

    void withLoader(fetchAll, "Gathering trending discussions...");
    return () => {
      isMounted = false;
    };
  }, [withLoader]);

  const content = useMemo(() => {
    if (!hasLoaded) {
      return <p className={styles.status}>Loading discussions...</p>;
    }
    if (state.error) {
      return <p className={styles.statusError}>{state.error}</p>;
    }
    if (!state.items.length) {
      return <p className={styles.status}>No discussions found right now.</p>;
    }
    return (
      <section className={styles.grid}>
        {state.items.map((discussion) => (
          <a
            key={`${discussion.source}-${discussion.title}`}
            href={discussion.link}
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <div className={styles.badgeRow}>
              <span className={styles.badge}>{discussion.category}</span>
              <span className={styles.source}>{discussion.source}</span>
            </div>
            <h3 className={styles.cardTitle}>{discussion.title}</h3>
            <p className={styles.summary}>{discussion.summary}</p>
            <div className={styles.footer}>
              <span className={styles.linkHint}>Open discussion →</span>
            </div>
          </a>
        ))}
      </section>
    );
  }, [hasLoaded, state.error, state.items]);

  return (
    <Layout>
      {content}
    </Layout>
  );
}
