import { useEffect, useMemo, useState } from "react";
import styles from "./Table.module.css";

interface TableProps {
  headers: string[];
  data: Record<string, unknown>[];
  enableStatusFilter?: boolean;
}

export default function Table({
  headers,
  data,
  enableStatusFilter = true,
}: TableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const perPage = 10;

  const getComparableValue = (row: Record<string, unknown>, header: string) => {
    const value = row[header] ?? row[header.toLowerCase()];
    if (typeof value === "number") return value;
    if (typeof value === "string") return value.toLowerCase();
    return String(value ?? "");
  };

  const handleSort = (header: string) => {
    setPage(1);
    if (sortKey === header) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(header);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const effectiveFilter = enableStatusFilter ? filter : "All";
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
        effectiveFilter === "All" ||
        statusValue.toLowerCase() === effectiveFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [data, search, filter, enableStatusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const sortedRows = [...filtered].sort((a, b) => {
      const aVal = getComparableValue(a, sortKey);
      const bVal = getComparableValue(b, sortKey);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sortedRows;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {enableStatusFilter && (
          <select
            className={styles.select}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Backlog</option>
          </select>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            {headers.map((h) => (
              <th
                className={`${styles.th} ${styles.sortable}`}
                key={h}
                onClick={() => handleSort(h)}
              >
                {h}
                {sortKey === h ? (sortDir === "asc" ? " ^" : " v") : ""}
              </th>
            ))}
          </tr>
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
        <button
          type="button"
          className={styles.pageButton}
          disabled={page === 1}
          onClick={() => setPage(Math.max(page - 1, 1))}
        >
          Prev
        </button>
        {pageNumbers.map((num) => (
          <button
            type="button"
            key={num}
            className={`${styles.pageButton} ${
              num === page ? styles.pageButtonActive : ""
            }`}
            onClick={() => setPage(num)}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className={styles.pageButton}
          disabled={page === totalPages}
          onClick={() => setPage(Math.min(page + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
