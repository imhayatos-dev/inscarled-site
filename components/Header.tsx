"use client";

import { useState } from "react";

import {
  FaInstagram,
  FaYoutube,
  FaSpotify,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="header">
      <img
        src="/inscarled-logo.png"
        alt="inScarled"
        className="header-logo"
      />

      <ul className={`menu ${menuOpen ? "active" : ""}`}>
        <li>
          <a href="#news" onClick={() => setMenuOpen(false)}>
            NEWS
          </a>
        </li>

        <li>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            ABOUT
          </a>
        </li>

        <li>
          <a href="#music" onClick={() => setMenuOpen(false)}>
            MUSIC
          </a>
        </li>

        <li>
          <a href="#live" onClick={() => setMenuOpen(false)}>
            LIVE
          </a>
        </li>

        <li>
          <a href="#media" onClick={() => setMenuOpen(false)}>
            MEDIA
          </a>
        </li>
      </ul>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <div className="socials">
        <a href="#">
          <FaXTwitter />
        </a>

        <a href="#">
          <FaInstagram />
        </a>

        <a href="#">
          <FaYoutube />
        </a>

        <a href="#">
          <FaSpotify />
        </a>
      </div>
    </nav>
  );
}