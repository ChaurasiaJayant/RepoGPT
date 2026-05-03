import "../components/Github.css";
import { useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiBuildingsFill } from "react-icons/pi";
import githubSVG from "../assets/githubSVG.svg";
import { useNavigate } from "react-router-dom";

const GithubSearch = () => {
  const [userName, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [repos, setRepos] = useState([]);
  const navigate = useNavigate();

  // function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `https://api.github.com/users/${userName}`,
      );

      const repoResponse = await axios.get(
        `https://api.github.com/users/${userName}/repos`,
      );

      setProfile(response.data);
      setRepos(repoResponse.data);
      setError(null);
    } catch (error) {
      setProfile(null);
      setError("User not found");
    }
  };

  // UI part
  return (
    <div className="main-container">
      <h1 className="main-heading">AI-Powered GitHub Analyzer</h1>
      <h3 className="h3">Inspect. Analyze. Improve.</h3>

      <form action="" onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Enter GitHub Username..."
          value={userName}
          className="search-input"
          onChange={(el) => setUsername(el.target.value)}
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {/* Information */}
      {profile && (
        <div className="profile-container">
          <div className="profile-content">
            <div className="profile-img">
              <img
                className="profile-avatar"
                src={profile?.avatar_url}
                alt="Avatar"
              />
            </div>
            <div className="profile-details">
              <div className="profile-des">
                <h1 className="profile-name">{profile?.name || "No Name"}</h1>
                <p className="profile-created">
                  Joined:{" "}
                  {profile?.created_at &&
                    new Date(profile.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                </p>
              </div>

              {/* github profile */}
              <div className="link">
                <img src={githubSVG} alt="" className="githubsvg" />
                <a
                  href={profile?.html_url}
                  target="_blank"
                  className="profile-username"
                  rel="noreferrer"
                >
                  @{profile?.login}
                </a>
              </div>
              <p className="profile-bio">{profile?.bio}</p>

              {/* followers section */}
              <div className="profile-stats">
                <div className="profile-repos">
                  Repositories <br />{" "}
                  <span className="stats">{profile?.public_repos}</span>
                </div>
                <div className="profile-followers">
                  Followers <br />{" "}
                  <span className="stats">{profile?.followers || 0}</span>
                </div>
                <div className="profile-following">
                  Following <br />{" "}
                  <span className="stats">{profile?.following ?? 0}</span>
                </div>
              </div>
              <div className="profile-info">
                <p className="profile-location">
                  <FaMapMarkerAlt />
                  {profile?.location || "Somewhere on Earth"}
                </p>
                <p className="profile-company">
                  <PiBuildingsFill />
                  {profile?.company || "No organization listed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repository */}
      {repos.length > 0 && (
        <div className="repo-container">
          <h2 className="repo-h">Repositories</h2>

          <div className="repo-list">
            {repos.map((repo) => (
              <div key={repo.id} className="repo-card">
                <div className="repo-left">
                  <h3 className="repo-name">{repo.name}</h3>

                  {/* <div className="repo-des"> */}
                  <p className="repo-des">
                    {repo.description || "No description available"}
                  </p>
                </div>
                {/* <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-btn"
                >
                  Analyze Code
                </a> */}
                <button
                  target="_blank"
                  className="repo-btn"
                  onClick={() =>
                    navigate("/analyze", {
                      state: { repo },
                    })
                  }
                >
                  Analyze Code
                </button>
              </div>
              // </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubSearch;
