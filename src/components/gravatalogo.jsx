import React from "react";
import "./gravatalogo.css";

export default function GravataLogo() {
    return (
        <div className="gravata-logo-container">

            <svg
                className="gravata-logo-svg"
                viewBox="0 0 200 360"
                xmlns="http://www.w3.org/2000/svg"
            >

                <defs>
                    {/* gradiente principal dourado metálico */}
                    <linearGradient id="gold-main" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff2b0" />
                        <stop offset="15%" stopColor="#f6d978" />
                        <stop offset="40%" stopColor="#d9ac43" />
                        <stop offset="70%" stopColor="#c28c2f" />
                        <stop offset="100%" stopColor="#9c6f22" />
                    </linearGradient>

                    {/* brilho lateral */}
                    <linearGradient id="gold-side" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>

                    {/* brilho central vertical */}
                    <linearGradient id="gold-center" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>

                    {/* sombra do nó */}
                    <radialGradient id="nodo-depth" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="#fce08d" />
                        <stop offset="60%" stopColor="#d9a845" />
                        <stop offset="100%" stopColor="#a77c2b" />
                    </radialGradient>
                </defs>

                {/* Nó da gravata com efeito 3D suave */}
                <path
                    d="M50 40 L150 40 L175 95 L100 140 L25 95 Z"
                    fill="url(#nodo-depth)"
                />

                {/* Corpo principal afunilado da gravata */}
                <path
                    d="M70 140 L130 140 C150 210 150 265 130 335 L70 335 C50 265 50 210 70 140 Z"
                    fill="url(#gold-main)"
                />

                {/* Brilho lateral esquerdo */}
                <path
                    d="M75 145 L85 145 C70 210 70 260 85 330 L75 330 Z"
                    fill="url(#gold-side)"
                    opacity="0.35"
                />

                {/* Brilho lateral direito */}
                <path
                    d="M115 145 L125 145 C140 210 140 260 125 330 L115 330 Z"
                    fill="url(#gold-side)"
                    opacity="0.35"
                />

                {/* Linha de brilho central espelhada */}
                <rect
                    x="97"
                    y="145"
                    width="6"
                    height="185"
                    fill="url(#gold-center)"
                />

                {/* Reflexo suave no centro */}
                <ellipse
                    cx="100"
                    cy="230"
                    rx="26"
                    ry="110"
                    fill="rgba(255,255,255,0.10)"
                />

            </svg>

        </div>
    );
}
