import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import api from "../services/api";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "LIBRARIAN" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
}

const API_URL = "http://localhost:5000";

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/user/profile");

      setProfile(response.data);
      setName(response.data.name || "");
    } catch (error: any) {
      console.error("LOAD PROFILE ERROR:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/user/profile", {
        name: name.trim(),
      });

      const updatedUser = response.data.user;

      setProfile(updatedUser);
      setName(updatedUser.name);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              name: updatedUser.name,
              profileImage: updatedUser.profileImage,
            })
          );
        } catch {
          console.warn("Unable to update local user data.");
        }
      }

      setSuccess("Profile updated successfully.");
    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Profile picture must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.post(
        "/user/profile/avatar",
        formData
      );

      const updatedUser = response.data.user;

      setProfile(updatedUser);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              profileImage: updatedUser.profileImage,
              name: updatedUser.name,
            })
          );
        } catch {
          console.warn("Unable to update local user data.");
        }
      }

      setSuccess("Profile picture updated successfully.");
    } catch (error: any) {
      console.error("UPLOAD PROFILE IMAGE ERROR:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to upload profile picture."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const getProfileImageUrl = () => {
    if (!profile?.profileImage) {
      return null;
    }

    return `${API_URL}${profile.profileImage}`;
  };

  const profileImageUrl = getProfileImageUrl();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>{error || "Unable to load profile."}</p>

          <button
            type="button"
            onClick={loadProfile}
            className="profile-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">MY ACCOUNT</p>
            <h1>Student Profile</h1>
            <p className="profile-subtitle">
              Manage your personal information and profile picture.
            </p>
          </div>
        </div>

        {error && (
          <div className="profile-alert profile-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert profile-alert-success">
            {success}
          </div>
        )}

        <div className="profile-grid">
          <section className="profile-card profile-card-left">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${profile.name}'s profile`}
                    className="profile-avatar-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <User size={64} />
                  </div>
                )}

                {uploading && (
                  <div className="profile-avatar-overlay">
                    <Loader2 size={30} className="spin" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                hidden
              />

              <button
                type="button"
                className="profile-upload-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={17} className="spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera size={17} />
                    Change Picture
                  </>
                )}
              </button>

              <p className="profile-upload-help">
                JPG, PNG, or WEBP. Maximum 5 MB.
              </p>
            </div>

            <div className="profile-account-info">
              <div className="profile-role-badge">
                <ShieldCheck size={16} />
                {profile.role}
              </div>

              <h2>{profile.name}</h2>

              <p>
                <Mail size={16} />
                {profile.email}
              </p>
            </div>
          </section>

          <section className="profile-card">
            <div className="profile-card-title">
              <div className="profile-title-icon">
                <User size={20} />
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>
                  Update the information associated with your account.
                </p>
              </div>
            </div>

            <div className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="profile-name">
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  disabled={saving}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-email">
                  Email Address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  readOnly
                />

                <small>
                  Email address cannot be changed here.
                </small>
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-role">
                  Account Role
                </label>

                <input
                  id="profile-role"
                  type="text"
                  value={profile.role}
                  disabled
                  readOnly
                />
              </div>

              <button
                type="button"
                className="profile-save-button"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}