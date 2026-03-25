import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/userService";
import "./ProfilePage.css";

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
    profile_image: null,
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append("name", profile.name || "");
      formData.append("phone", profile.phone || "");
      formData.append("address", profile.address || "");
      formData.append("bio", profile.bio || "");

      const res = await updateProfile(formData);

      setMessage({
        type: "success",
        text: res.message || "Profile updated!",
      });

      // Force a hard jump back to dashboard to trigger AuthContext global sync
      setTimeout(() => window.location.href = '/dashboard', 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update profile";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>Update your personal information and profile picture</p>
      </div>

      {message.type && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile.name || ""}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={profile.phone || ""}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={profile.address || ""}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            rows="4"
            value={profile.bio || ""}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile.email || user.email}
            readOnly
          />
        </div>

        <button type="submit" disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </button>

        <button type="button" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;