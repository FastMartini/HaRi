import "./navbar.css";


export default function Navbar() {
return (
<>
<header className="navbar">
<div className="inner">
{/* Left: Brand */}
<a href="#" className="brand">HaRi</a>


{/* Center: Links */}
<nav className="links">
<a href="/pricing">Pricing</a>
<a href="/docs">Docs</a>
<a href="/resources">Resources</a>
</nav>


{/* Right: Discover us (always visible) + Mobile menu */}
<div className="right">
<a href="/discover" className="cta">Discover us</a>


<details className="menu">
<summary>
<span className="sr-only">Open menu</span>
<IconMenu />
</summary>
<div className="dropdown">
<a href="/pricing">Pricing</a>
<a href="/docs">Docs</a>
<a href="/resources">Resources</a>
</div>
</details>
</div>
</div>
</header>


{/* Spacer so content doesn't sit under the bar */}
<div className="navbar-spacer" />
</>
);
}


function IconMenu() {
return (
<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M3 6h18M3 12h18M3 18h18" />
</svg>
);
}