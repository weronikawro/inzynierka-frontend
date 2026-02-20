import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import "./users_admin.css";

import DeleteIcon from "../../assets/icons/delete.svg";

function UsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Błąd pobierania użytkowników:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.userName && u.userName.toLowerCase().includes(query)) ||
          (u.firstName && u.firstName.toLowerCase().includes(query)),
      ),
    );
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getSortedUsers = () => {
    const sorted = [...filteredUsers];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.",
      )
    ) {
      return;
    }

    try {
      await ApiService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("Użytkownik został usunięty.");
    } catch (e) {
      alert("Nie udało się usunąć użytkownika.");
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const displayedUsers = getSortedUsers();
  const getSortIndicator = (k) =>
    sortConfig.key !== k ? null : sortConfig.direction === "asc" ? "▲" : "▼";

  return (
    <div className="admin-content-container">
      <div className="admin-page-header">
        <div>
          <h1>Użytkownicy</h1>
          <p>Zarządzaj kontami użytkowników aplikacji</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Szukaj po e-mailu lub nazwie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="stats-badge">
          Liczba użytkowników: {displayedUsers.length}
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#a0aec0" }}
          >
            Ładowanie...
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th width="60">Avatar</th>
                <th
                  onClick={() => handleSort("userName")}
                  className="sortable-th"
                >
                  Użytkownik {getSortIndicator("userName")}
                </th>
                <th onClick={() => handleSort("email")} className="sortable-th">
                  E-mail {getSortIndicator("email")}
                </th>
                <th onClick={() => handleSort("role")} className="sortable-th">
                  Rola {getSortIndicator("role")}
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="sortable-th"
                >
                  Dołączył {getSortIndicator("createdAt")}
                </th>
                <th width="80" style={{ textAlign: "right" }}>
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length > 0 ? (
                displayedUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-avatar-small">
                        {u.image ? (
                          <img src={u.image} alt="user" />
                        ) : (
                          getInitials(u.userName || u.firstName || u.email)
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {u.userName ||
                        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                        "Bez nazwy"}
                    </td>
                    <td style={{ color: "#4a5568" }}>{u.email}</td>
                    <td>
                      <span
                        className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}
                      >
                        {u.role === "admin" ? "Administrator" : "Użytkownik"}
                      </span>
                    </td>
                    <td style={{ color: "#718096" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {u.email !== user.email && (
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Usuń użytkownika"
                          >
                            <img src={DeleteIcon} alt="Usuń" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#a0aec0",
                    }}
                  >
                    Brak użytkowników
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
