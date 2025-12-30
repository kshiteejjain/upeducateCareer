import { useState, useMemo } from "react";
import styles from "./Table.module.css";

interface TableProps {
  headers: string[];
  data: any[];
}

export default function Table({ headers, data }: TableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const perPage = 10;

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchSearch = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const statusValue =
        typeof row.statusText === "string"
          ? row.statusText
          : typeof row.Status === "string"
          ? row.Status
          : "";
      const matchFilter =
        filter === "All" ||
        statusValue.toLowerCase() === filter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [data, search, filter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Backlog</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>{headers.map((h) => <th className={styles.th} key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {paginated.map((row, i) => (
            <tr className={styles.tr} key={i}>
              {headers.map((header, j) => (
                <td className={styles.td} key={j}>
                  {row[header] ?? row[header.toLowerCase()] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ◀
        </button>
        <span>
          Page {page} / {totalPages || 1}
        </span>
        <button
        className="button"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
