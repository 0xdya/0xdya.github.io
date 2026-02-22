<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>RSS — <xsl:value-of select="/rss/channel/title"/></title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
        <style>
          :root {{
            --bg: #080808;
            --text: #e8e8e8;
            --muted: #888;
            --dim: #555;
            --accent: #c8b560;
            --accent-dim: rgba(200,181,96,.12);
            --border: rgba(255,255,255,.07);
            --card-bg: rgba(255,255,255,.025);
          }}

          * {{ margin: 0; padding: 0; box-sizing: border-box; }}

          body {{
            background: var(--bg);
            color: var(--text);
            font-family: "IBM Plex Sans Arabic", system-ui, sans-serif;
            font-size: 1rem;
            line-height: 1.9;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
            padding-bottom: 80px;
          }}

          /* Grid background */
          body::before {{
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image:
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: radial-gradient(800px 800px at top left, black 0%, transparent 60%);
            z-index: 0;
          }}

          .container {{
            position: relative;
            z-index: 1;
            max-width: 720px;
            margin-inline: auto;
            padding-inline: 32px;
          }}

          /* Header */
          header {{
            padding-top: 48px;
            margin-bottom: 48px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
          }}

          .logo {{
            font-size: 1.55rem;
            color: var(--text);
            font-weight: 400;
            text-decoration: none;
          }}

          .subtitle {{
            margin-top: 4px;
            font-size: .88rem;
            color: var(--muted);
            font-weight: 300;
          }}

          /* RSS badge */
          .rss-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--accent-dim);
            border: 1px solid rgba(200,181,96,.25);
            border-radius: 8px;
            padding: 6px 14px;
            font-family: "JetBrains Mono", monospace;
            font-size: .78rem;
            color: var(--accent);
            text-decoration: none;
            transition: background .2s;
          }}

          .rss-badge:hover {{ background: rgba(200,181,96,.2); }}

          .rss-dot {{
            width: 7px; height: 7px;
            border-radius: 50%;
            background: var(--accent);
            animation: pulse 2s ease-in-out infinite;
          }}

          @keyframes pulse {{
            0%, 100% {{ opacity: 1; transform: scale(1); }}
            50% {{ opacity: .5; transform: scale(.8); }}
          }}

          /* Section title */
          .section-title {{
            font-size: .78rem;
            color: var(--dim);
            text-transform: uppercase;
            font-family: "JetBrains Mono", monospace;
            letter-spacing: .08em;
            margin-bottom: 16px;
          }}

          /* Subscribe box */
          .subscribe-box {{
            border: 1px solid var(--border);
            background: var(--card-bg);
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 48px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }}

          .subscribe-box .info {{ flex: 1; min-width: 200px; }}
          .subscribe-box .info p {{ font-size: .85rem; color: var(--muted); font-weight: 300; }}

          .copy-url {{
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,.04);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 14px;
            font-family: "JetBrains Mono", monospace;
            font-size: .78rem;
            color: var(--dim);
            cursor: pointer;
            transition: all .2s;
            white-space: nowrap;
            user-select: all;
          }}

          .copy-url:hover {{
            border-color: rgba(200,181,96,.3);
            color: var(--accent);
            background: var(--accent-dim);
          }}

          /* Items */
          .items {{ display: flex; flex-direction: column; gap: 12px; }}

          .item {{
            border: 1px solid var(--border);
            background: var(--card-bg);
            border-radius: 10px;
            padding: 20px 24px;
            transition: border-color .2s, background .2s;
            text-decoration: none;
            display: block;
            animation: fadeIn .4s ease both;
          }}

          .item:hover {{
            border-color: rgba(200,181,96,.2);
            background: var(--accent-dim);
          }}

          @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(8px); }}
            to {{ opacity: 1; transform: translateY(0); }}
          }}

          .item-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 8px;
            flex-wrap: wrap;
          }}

          .item-title {{
            font-size: 1rem;
            color: var(--text);
            font-weight: 400;
            line-height: 1.5;
          }}

          .item-meta {{
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
          }}

          .item-category {{
            font-family: "JetBrains Mono", monospace;
            font-size: .72rem;
            color: var(--accent);
            opacity: .8;
            background: var(--accent-dim);
            padding: 2px 8px;
            border-radius: 4px;
          }}

          .item-date {{
            font-family: "JetBrains Mono", monospace;
            font-size: .72rem;
            color: var(--dim);
          }}

          .item-desc {{
            font-size: .88rem;
            color: var(--muted);
            font-weight: 300;
            line-height: 1.7;
          }}

          /* Arrow link */
          .item-link {{
            margin-top: 10px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: .82rem;
            color: var(--dim);
            transition: color .2s, gap .2s;
          }}

          .item:hover .item-link {{
            color: var(--accent);
            gap: 10px;
          }}

          /* Empty state */
          .empty {{
            text-align: center;
            padding: 64px 0;
            color: var(--dim);
            font-size: .88rem;
            font-family: "JetBrains Mono", monospace;
          }}

          /* Footer */
          footer {{
            margin-top: 64px;
            padding-bottom: 48px;
            border-top: 1px solid var(--border);
          }}

          .footer-text {{
            margin-top: 16px;
            font-size: .72rem;
            color: var(--dim);
            font-family: "JetBrains Mono", monospace;
          }}

          @media (max-width: 640px) {{
            .container {{ padding-inline: 16px; }}
            header {{ flex-direction: column; }}
            .subscribe-box {{ flex-direction: column; align-items: flex-start; }}
            .item-meta {{ flex-direction: column; align-items: flex-end; gap: 4px; }}
          }}
        </style>
      </head>
      <body>
        <div class="container">

          <header>
            <div>
              <a class="logo" href="https://0xdya.github.io"><xsl:value-of select="/rss/channel/title"/></a>
              <p class="subtitle"><xsl:value-of select="/rss/channel/description"/></p>
            </div>
            <a class="rss-badge" href="{/rss/channel/atom:link/@href}">
              <div class="rss-dot"/>
              RSS Feed
            </a>
          </header>

          <!-- Subscribe -->
          <div class="subscribe-box">
            <div class="info">
              <p class="section-title">// اشترك في التحديثات</p>
              <p>انسخ الرابط أدناه وأضفه لأي RSS reader مثل Feedly أو NetNewsWire</p>
            </div>
            <span class="copy-url" onclick="navigator.clipboard.writeText(this.innerText).then(()=>{{this.innerText='✓ تم النسخ';setTimeout(()=>this.innerText='https://0xdya.github.io/feed.xml',2000)}})">https://0xdya.github.io/feed.xml</span>
          </div>

          <!-- Items -->
          <p class="section-title">// آخر التحديثات (<xsl:value-of select="count(/rss/channel/item)"/>)</p>
          <div class="items">
            <xsl:choose>
              <xsl:when test="/rss/channel/item">
                <xsl:for-each select="/rss/channel/item">
                  <a class="item" href="{link}">
                    <div class="item-header">
                      <span class="item-title"><xsl:value-of select="title"/></span>
                      <div class="item-meta">
                        <xsl:if test="category">
                          <span class="item-category"><xsl:value-of select="category"/></span>
                        </xsl:if>
                        <span class="item-date"><xsl:value-of select="substring(pubDate,1,16)"/></span>
                      </div>
                    </div>
                    <xsl:if test="description">
                      <p class="item-desc"><xsl:value-of select="description"/></p>
                    </xsl:if>
                    <span class="item-link">
                      اقرأ المزيد
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.91 19.92L15.43 13.4c.77-.77.77-2.03 0-2.8L8.91 4.08"/>
                      </svg>
                    </span>
                  </a>
                </xsl:for-each>
              </xsl:when>
              <xsl:otherwise>
                <div class="empty">// لا توجد مقالات بعد</div>
              </xsl:otherwise>
            </xsl:choose>
          </div>

          <footer>
            <a class="logo" href="https://0xdya.github.io" style="font-size:1rem">0xdya.github.io</a>
            <p class="footer-text">© 2026 ضياء الدين ملوك — RSS 2.0</p>
          </footer>

        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
