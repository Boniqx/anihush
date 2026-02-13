"use client";

import {
  Compass,
  Flame,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Heart,
} from "lucide-react";
import Image from "next/image";

export default function ExplorePage() {
  const trendingTags = [
    { name: "Yandere", count: "1.2k" },
    { name: "Maid", count: "856" },
    { name: "Tsundere", count: "2.4k" },
    { name: "Office Lady", count: "542" },
    { name: "Fantasy", count: "3.1k" },
  ];

  const featuredCompanions = [
    {
      name: "Albedo",
      image: "/images/explore/albedo_featured.png",
      desc: "Overseer of the Guardians",
      tag: "Overlord",
    },
    {
      name: "Esdeath",
      image: "/images/explore/esdeath.png",
      desc: "General of the Empire",
      tag: "Akame ga Kill",
    },
    {
      name: "Rias Gremory",
      image: "/images/explore/rias-gremory.png",
      desc: "Crimson-Haired Ruin Princess",
      tag: "High School DxD",
    },
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff7e27] to-[#ffb700] bg-clip-text text-transparent w-fit">
          Explore
        </h1>
        <p className="text-[#a0a0b0]">
          Discover new companions and trending stories.
        </p>
      </div>

      {/* Featured Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#ff7e27]">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">
            Featured This Week
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredCompanions.map((comp, i) => (
            <div
              key={i}
              className="group relative h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={comp.image}
                alt={comp.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-[#ff7e27] uppercase tracking-wider mb-1">
                  {comp.tag}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#ff7e27] transition-colors">
                  {comp.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {comp.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Tags */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#ff4757]">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">Trending Tags</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {trendingTags.map((tag, i) => (
            <div
              key={i}
              className="bg-[#1a1a23] hover:bg-[#272732] border border-white/5 px-4 py-3 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
            >
              <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                #{tag.name}
              </span>
              <span className="text-xs text-gray-500 bg-black/30 px-2 py-0.5 rounded-full">
                {tag.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals (Mock List) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#2ed573]">
          <Flame className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">New Arrivals</h2>
        </div>
        <div className="bg-[#1a1a23]/50 border border-white/5 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden relative">
                <Image
                  src={`/images/explore/construct_${i + 1}.png`}
                  alt="New"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-200">
                  Construct {i + 42}
                </h4>
                <p className="text-xs text-gray-500">
                  Just joined the platform
                </p>
              </div>
              <button className="text-xs font-bold text-[#ff7e27] bg-[#ff7e27]/10 px-3 py-1.5 rounded-lg hover:bg-[#ff7e27] hover:text-black transition-all">
                Chat
              </button>
            </div>
          ))}
        </div>
      </section>
      {/* Community Posts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#70a1ff]">
          <MessageCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">Community Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: "Late night gaming session 🎮",
              image: "/images/explore/post_gaming.png",
              user: "Gojo",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gojo",
              likes: 124,
              comments: 45,
            },
            {
              id: 2,
              title: "Just finished this new recipe!",
              image: "/images/explore/post_cooking.png",
              user: "Yor",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yor",
              likes: 892,
              comments: 120,
            },
            {
              id: 3,
              title: "Exploring the new dungeon update",
              image: "/images/explore/post_dungeon.png",
              user: "Kirito",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kirito",
              likes: 567,
              comments: 32,
            },
            {
              id: 4,
              title: "Anyone else see that sunset?",
              image: "/images/explore/post_sunset.png",
              user: "Makima",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Makima",
              likes: 2300,
              comments: 405,
            },
          ].map((post) => (
            <div
              key={post.id}
              className="bg-[#1a1a23] rounded-2xl overflow-hidden border border-[#27272a] hover:border-[#ff7e27]/30 transition-all group"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#27272a] overflow-hidden">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#eee]">
                    {post.user}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mb-3 line-clamp-1">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-[#a0a0b0] text-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
