"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaUpload, FaTimes, FaUser, FaJava, FaVuejs } from "react-icons/fa";
import { FaTwitter, FaInstagram, FaFigma, FaProductHunt, FaBehance, FaTiktok, FaYoutube, FaMastodon, FaCode } from "react-icons/fa";
import { SiWellfound, SiThreads, SiJavascript, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiHtml5, SiCss3, SiDocker, SiAmazon, SiGo, SiRust, SiKotlin, SiSwift, SiFlutter, SiMongodb, SiPostgresql, SiTailwindcss, SiGit, SiMysql, SiFirebase, SiSupabase, SiGraphql, SiRedux, SiSvelte, SiAngular, SiCplusplus, SiDotnet, SiPhp, SiRuby, SiLaravel, SiSpring, SiDjango, SiFlask } from "react-icons/si";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    pronouns: "",
    website: "",
    calendarLink: "",
    skills: [], // New skills array
    socialLinks: {
      twitter: "",
      instagram: "",
      figma: "",
      producthunt: "",
      wellfound: "",
      behance: "",
      mastodon: "",
      tiktok: "",
      youtube: "",
      threads: ""
    }
  });

  // Search States
  const [locationQuery, setLocationQuery] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]); // Dynamic popular skills

  // Icon Mapping Helper
  const getSkillIcon = (skillName) => {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = normalize(skillName);

    // Map normalized names to icons and specific colors
    const iconMap = {
      "javascript": <SiJavascript className="text-yellow-400" />,
      "js": <SiJavascript className="text-yellow-400" />,
      "typescript": <SiTypescript className="text-blue-600" />,
      "ts": <SiTypescript className="text-blue-600" />,
      "python": <SiPython className="text-blue-500" />,
      "reactjs": <SiReact className="text-cyan-400" />,
      "react": <SiReact className="text-cyan-400" />,
      "reactnative": <SiReact className="text-cyan-400" />,
      "nextjs": <SiNextdotjs className="text-black" />,
      "nodejs": <SiNodedotjs className="text-green-600" />,
      "node": <SiNodedotjs className="text-green-600" />,
      "html": <SiHtml5 className="text-orange-500" />,
      "html5": <SiHtml5 className="text-orange-500" />,
      "css": <SiCss3 className="text-blue-500" />,
      "css3": <SiCss3 className="text-blue-500" />,
      "java": <FaJava className="text-red-500" />,
      "c": <SiCplusplus className="text-blue-600" />, // Closest match
      "cpp": <SiCplusplus className="text-blue-600" />,
      "cplusplus": <SiCplusplus className="text-blue-600" />,
      "csharp": <SiDotnet className="text-purple-600" />,
      "go": <SiGo className="text-cyan-600" />,
      "golang": <SiGo className="text-cyan-600" />,
      "rust": <SiRust className="text-orange-600" />,
      "kotlin": <SiKotlin className="text-purple-600" />,
      "swift": <SiSwift className="text-orange-500" />,
      "flutter": <SiFlutter className="text-cyan-500" />,
      "php": <SiPhp className="text-indigo-400" />,
      "ruby": <SiRuby className="text-red-600" />,
      "rails": <SiRuby className="text-red-600" />,
      "laravel": <SiLaravel className="text-red-500" />,
      "django": <SiDjango className="text-green-700" />,
      "flask": <SiFlask className="text-gray-600" />,
      "spring": <SiSpring className="text-green-500" />,
      "docker": <SiDocker className="text-blue-500" />,
      "aws": <SiAmazon className="text-orange-400" />,
      "amazonwebservices": <SiAmazon className="text-orange-400" />,
      "mongodb": <SiMongodb className="text-green-500" />,
      "postgres": <SiPostgresql className="text-blue-400" />,
      "postgresql": <SiPostgresql className="text-blue-400" />,
      "sql": <SiPostgresql className="text-blue-400" />, // Generic SQL
      "mysql": <SiMysql className="text-blue-500" />,
      "firebase": <SiFirebase className="text-yellow-500" />,
      "supabase": <SiSupabase className="text-green-400" />,
      "graphql": <SiGraphql className="text-pink-600" />,
      "redux": <SiRedux className="text-purple-500" />,
      "tailwind": <SiTailwindcss className="text-cyan-400" />,
      "tailwindcss": <SiTailwindcss className="text-cyan-400" />,
      "git": <SiGit className="text-orange-500" />,
      "figma": <FaFigma className="text-purple-500" />, // Use FA for consistency with other parts if desired, but Si is fine too
      "vue": <FaVuejs className="text-green-500" />,
      "vuejs": <FaVuejs className="text-green-500" />,
      "angular": <SiAngular className="text-red-600" />,
      "svelte": <SiSvelte className="text-orange-500" />,
    };

    return iconMap[name] || <FaCode className="text-gray-400" />;
  };

  // Helper to format raw StackOverflow tags (e.g., "react-native" -> "React Native")
  const formatDisplayName = (rawName) => {
    const overrides = {
      "html": "HTML",
      "css": "CSS",
      "javascript": "JavaScript", "js": "JavaScript",
      "typescript": "TypeScript", "ts": "TypeScript",
      "reactjs": "React", "react": "React",
      "next.js": "Next.js", "nextjs": "Next.js",
      "node.js": "Node.js", "nodejs": "Node.js",
      "vue.js": "Vue.js", "vuejs": "Vue.js",
      "angularjs": "Angular", "angular": "Angular",
      "c#": "C#", "csharp": "C#",
      "c++": "C++", "cpp": "C++",
      "php": "PHP", "sql": "SQL", "aws": "AWS",
      "ui": "UI Design", "ux": "UX Design",
    };

    if (overrides[rawName.toLowerCase()]) return overrides[rawName.toLowerCase()];

    // Default: Title Case and replace hyphens
    return rawName
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Re-introducing popular skills for the "Suggested" section
  // Removed static list, now fetching dynamically

  // Derived state for display
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Fetch user data
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const data = res.data;
          setUser(data);
          // Parse name
          const [first, ...rest] = (data.name || "").split(" ");

          setFormData({
            firstName: data.firstName || first || "",
            lastName: data.lastName || rest.join(" ") || "",
            bio: data.bio || "",
            location: data.location || "",
            pronouns: data.pronouns || "",
            website: data.website || "",
            calendarLink: data.calendarLink || "",
            socialLinks: {
              twitter: data.socialLinks?.twitter || "",
              instagram: data.socialLinks?.instagram || "",
              figma: data.socialLinks?.figma || "",
              producthunt: data.socialLinks?.producthunt || "",
              wellfound: data.socialLinks?.wellfound || "",
              behance: data.socialLinks?.behance || "",
              mastodon: data.socialLinks?.mastodon || "",
              tiktok: data.socialLinks?.tiktok || "",
              youtube: data.socialLinks?.youtube || "",
              threads: data.socialLinks?.threads || "",
            }
          });
          setLocationQuery(data.location || "");
          if (data.skills && Array.isArray(data.skills)) {
            setFormData(prev => ({ ...prev, skills: data.skills }));
          }
          setAvatarUrl(data.avatarUrl || data.profilePicture || "");
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }

    // Fetch popular skills from StackOverflow for "Suggested" section
    axios.get("https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=15")
      .then(res => {
        const names = res.data.items.map(item => item.name);
        setSuggestedSkills(names);
      })
      .catch(err => console.error("Failed to fetch popular skills", err));

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const network = name.replace("social_", "");
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [network]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Location Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationQuery.length > 2) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`
          );
          setLocationSuggestions(res.data);
          setShowLocationSuggestions(true);
        } catch (error) {
          console.error("Location search failed", error);
        }
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  // Skills Search Debounce (StackOverflow API)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (skillQuery.length > 1) { // StackOverflow API works best with at least some chars
        try {
          // Fetch tags from StackOverflow
          const res = await axios.get(
            `https://api.stackexchange.com/2.3/tags?site=stackoverflow&inname=${skillQuery}&pagesize=30&order=desc&sort=popular`
          );
          setSkillSuggestions(res.data.items || []);
          setShowSkillSuggestions(true);
        } catch (error) {
          console.error("Skills search failed", error);
        }
      } else {
        setSkillSuggestions([]);
        setShowSkillSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [skillQuery]);

  const handleLocationChange = (e) => {
    setLocationQuery(e.target.value);
    // Don't set formData immediately if you want them to pick from list, 
    // but typically we allow free text too:
    setFormData(prev => ({ ...prev, location: e.target.value }));
  };

  const selectLocation = (locName) => {
    setLocationQuery(locName);
    setFormData(prev => ({ ...prev, location: locName }));
    setShowLocationSuggestions(false);
  };

  const addSkill = (skill) => {
    // 1. Format the skill first (e.g. "react-native" -> "React Native")
    const formattedSkill = formatDisplayName(skill).trim();

    // 2. Check for duplicates safely (case-insensitive)
    const exists = formData.skills.some(
      s => s.toLowerCase() === formattedSkill.toLowerCase()
    );

    if (formattedSkill && !exists) {
      if (formData.skills.length < 10) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, formattedSkill] }));
        setSkillQuery("");
        setShowSkillSuggestions(false);
      } else {
        alert("You can only add up to 10 skills.");
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillQuery);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAvatarUrl(res.data.url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        ...formData,
        name: fullName,
        avatarUrl
      };

      await axios.put("http://localhost:5000/api/users/me", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local user if needed
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...payload }));

      // alert("Profile updated successfully!"); // Optional: use toast or simpler feedback
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="relative pb-24">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span className="sr-only">Back</span>
          ←
        </button>
        <div className="text-sm font-medium text-gray-500">Settings</div>
        <div className="text-sm text-gray-300">→</div>
        <div className="text-sm font-bold text-gray-900">Profile</div>
      </div>

      <div className="px-8 py-8 space-y-12">

        {/* Basic Profile */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FaUser size={12} /> Basic Profile
          </h3>

          <div className="flex items-start gap-6 mb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUser size={24} />
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    ...
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm font-bold text-green-600 group-hover:underline">Upload new</div>
              <div className="text-xs text-gray-400">Recommended size: 400x400px</div>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">First name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Last name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Brief bio <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400">{formData.bio.length}/120</span>
            </div>
            <textarea
              name="bio"
              maxLength={120}
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none resize-none transition-colors"
            ></textarea>
            <p className="text-xs text-gray-400 mt-1.5">This is the very first thing peers read about you after your name.</p>
          </div>

          {/* Location - Searchable */}
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Search Cities / Country"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {locationSuggestions.map((place, idx) => (
                      <div
                        key={place.place_id || idx}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 truncate"
                        onMouseDown={(e) => { e.preventDefault(); selectLocation(place.display_name); }}
                      >
                        {place.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Personal pronouns</label>
                <select
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-0 outline-none bg-white transition-colors"
                >
                  <option value="">Select</option>
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Calendar link</label>
                <input
                  type="url"
                  name="calendarLink"
                  value={formData.calendarLink}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1.5">Add your Cal.com or Calendly URL.</p>
              </div>
            </div>
          </section>
        </section>

        <hr className="border-gray-100" />

        {/* Profile Tags - Searchable Skills */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            Profile Tags
          </h3>
          <div className="mb-4 relative">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Search skills, tools, roles</label>

            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <span key={skill} className="bg-white text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2 shadow-sm">
                  {getSkillIcon(skill)}
                  {formatDisplayName(skill)}
                  <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500 ml-1 transition-colors">
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              placeholder="Type a skill..."
              value={skillQuery}
              onChange={(e) => {
                setSkillQuery(e.target.value);
                setShowSkillSuggestions(true);
              }}
              onFocus={() => setShowSkillSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              onKeyDown={handleSkillKeyDown}
            />

            {showSkillSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-10">
                {/* Show "Create tag" option if users want to add something not in API */}
                {/* Show "Create tag" option if users want to add something not in API */}
                {/* Show "Create tag" option if users want to add something not in API */}
                {skillQuery && !skillSuggestions.some(s => s.name.toLowerCase() === skillQuery.toLowerCase()) && !formData.skills.some(s => s.toLowerCase() === skillQuery.toLowerCase()) && (
                  <div
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-green-600 border-b border-gray-50"
                    onMouseDown={(e) => { e.preventDefault(); addSkill(skillQuery); }}
                  >
                    + Create tag "{skillQuery}"
                  </div>
                )}

                {skillSuggestions
                  .filter(item => !formData.skills.some(s => s.toLowerCase() === item.name.toLowerCase()))
                  .map((item, idx) => (
                    <div
                      key={item.name || idx}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex items-center gap-2 transition-colors"
                      onMouseDown={(e) => { e.preventDefault(); addSkill(item.name); }}
                    >
                      {/* Optional: Show icon in search dropdown too */}
                      <span className="opacity-70">{getSkillIcon(item.name)}</span>
                      <span className="font-medium">{formatDisplayName(item.name)}</span>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Suggested Skills</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">Loading suggestions...</div>
                ) : (
                  suggestedSkills
                    .filter(skill => !formData.skills.some(s => s.toLowerCase() === skill.toLowerCase()))
                    .slice(0, 10) // Show top 10
                    .map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        {getSkillIcon(skill)}
                        {skill}
                        <span className="text-green-500 font-medium ml-1">+</span>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Social Links */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            Social Links
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-medium">Note: You only need to add your <span className="text-gray-900 font-bold">username</span>.</p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "twitter", icon: <FaTwitter />, prefix: "twitter.com/" },
              { name: "instagram", icon: <FaInstagram />, prefix: "instagram.com/" },
              { name: "figma", icon: <FaFigma />, prefix: "figma.com/@" },
              { name: "producthunt", icon: <FaProductHunt />, prefix: "producthunt.com/@" },
              { name: "wellfound", icon: <SiWellfound />, prefix: "wellfound.com/u/" },
              { name: "behance", icon: <FaBehance />, prefix: "behance.net/" },
              { name: "mastodon", icon: <FaMastodon />, placeholder: "Mastodon URL (full)" }, // No prefix for variable instances
              { name: "tiktok", icon: <FaTiktok />, prefix: "tiktok.com/@" },
              { name: "youtube", icon: <FaYoutube />, prefix: "youtube.com/" },
              { name: "threads", icon: <SiThreads />, prefix: "threads.net/@" },
            ].map((social) => (
              <div
                key={social.name}
                className="flex items-center w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all"
              >
                <div className="text-gray-400 mr-2.5 flex-shrink-0">
                  {social.icon}
                </div>
                {social.prefix && (
                  <span className="text-gray-400 text-sm select-none mr-0.5">{social.prefix}</span>
                )}
                <input
                  type="text"
                  name={`social_${social.name}`}
                  value={formData.socialLinks[social.name]}
                  onChange={handleChange}
                  placeholder={social.placeholder || "username"}
                  className="flex-1 min-w-0 text-sm text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sticky Footer Save - positioned absolute relative to container */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 rounded-b-xl flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
