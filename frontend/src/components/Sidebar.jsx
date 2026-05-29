import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import UserListItem from "./UserListItem";

const Sidebar = ({ selectedUser, onSelectUser, theme, onToggleTheme }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoadingUsers(true);

      try {
        const { data } = await api.get("/messages/users");

        if (isMounted) {
          setUsers(data.users);
        }
      } catch (error) {
        if (isMounted) {
          showToast(error.response?.data?.message || "Failed to load contacts", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((contact) => contact.name.toLowerCase().includes(value));
  }, [search, users]);

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div>
          <p className="eyebrow">Signed in</p>
          <h1>{user?.name}</h1>
        </div>
        <div className="sidebar-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? "L" : "D"}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => logout()}
            aria-label="Logout"
            title="Logout"
          >
            X
          </button>
        </div>
      </header>

      <div className="search-wrap">
        <input
          type="search"
          placeholder="Search contacts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="contact-list">
        {loadingUsers && <div className="list-state">Loading contacts...</div>}
        {!loadingUsers &&
          filteredUsers.map((contact) => (
            <UserListItem
              key={contact.id}
              user={contact}
              isActive={selectedUser?.id === contact.id}
              onSelect={onSelectUser}
            />
          ))}
        {!loadingUsers && filteredUsers.length === 0 && (
          <div className="list-state">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
