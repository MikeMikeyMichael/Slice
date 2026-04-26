/* SLICE Index — multi-lens calculator for the changing meaning of money. */
const { useMemo, useState, useEffect, useRef } = React;

function SliceLogo({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M32 32 L32 4 A28 28 0 0 1 48.46 9.36 Z" fill="currentColor" />
    </svg>
  );
}

/* ------------------- Data series ------------------- */

/* CPI-U annual average (1913..2024 provisional) — BLS */
const CPI_U_ANNUAL = {
  1913: 9.9, 1914: 10.0, 1915: 10.1, 1916: 10.9, 1917: 12.8, 1918: 15.0, 1919: 17.3,
  1920: 20.0, 1921: 17.9, 1922: 16.8, 1923: 17.1, 1924: 17.1, 1925: 17.5, 1926: 17.7,
  1927: 17.4, 1928: 17.1, 1929: 17.1, 1930: 16.7, 1931: 15.2, 1932: 13.7, 1933: 13.1,
  1934: 13.4, 1935: 13.7, 1936: 13.9, 1937: 14.4, 1938: 14.1, 1939: 13.9, 1940: 14.0,
  1941: 14.7, 1942: 16.3, 1943: 17.3, 1944: 17.6, 1945: 18.0, 1946: 19.5, 1947: 22.3,
  1948: 24.1, 1949: 23.8, 1950: 24.1, 1951: 26.0, 1952: 26.5, 1953: 26.7, 1954: 26.9,
  1955: 26.8, 1956: 27.2, 1957: 28.1, 1958: 28.9, 1959: 29.1, 1960: 29.6, 1961: 29.9,
  1962: 30.2, 1963: 30.6, 1964: 31.0, 1965: 31.5, 1966: 32.4, 1967: 33.4, 1968: 34.8,
  1969: 36.7, 1970: 38.8, 1971: 40.5, 1972: 41.8, 1973: 44.4, 1974: 49.3, 1975: 53.8,
  1976: 56.9, 1977: 60.6, 1978: 65.2, 1979: 72.6, 1980: 82.4, 1981: 90.9, 1982: 96.5,
  1983: 99.6, 1984: 103.9, 1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3,
  1989: 124.0, 1990: 130.7, 1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2,
  1995: 152.4, 1996: 156.9, 1997: 160.5, 1998: 163.0, 1999: 166.6, 2000: 172.2,
  2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9, 2005: 195.3, 2006: 201.6,
  2007: 207.342, 2008: 215.303, 2009: 214.537, 2010: 218.056, 2011: 224.939,
  2012: 229.594, 2013: 232.957, 2014: 236.736, 2015: 237.017, 2016: 240.007,
  2017: 245.120, 2018: 251.107, 2019: 255.657, 2020: 258.811, 2021: 270.970,
  2022: 292.655, 2023: 305.349, 2024: 319.0
};

/* Nominal GDP (billions USD), 1790..2024 — historical reconstructions + BEA */
const GDP_LOOKUP_BN = {
  1790: 0.193, 1791: 0.210, 1792: 0.230, 1793: 0.256, 1794: 0.321,
  1795: 0.390, 1796: 0.423, 1797: 0.415, 1798: 0.418, 1799: 0.447,
  1800: 0.486, 1801: 0.520, 1802: 0.456, 1803: 0.493, 1804: 0.538,
  1805: 0.567, 1806: 0.624, 1807: 0.595, 1808: 0.653, 1809: 0.694,
  1810: 0.714, 1811: 0.776, 1812: 0.795, 1813: 0.980, 1814: 1.090,
  1815: 0.935, 1816: 0.828, 1817: 0.777, 1818: 0.745, 1819: 0.735,
  1820: 0.718, 1821: 0.742, 1822: 0.816, 1823: 0.767, 1824: 0.762,
  1825: 0.832, 1826: 0.876, 1827: 0.925, 1828: 0.907, 1829: 0.940,
  1830: 1.032, 1831: 1.065, 1832: 1.142, 1833: 1.172, 1834: 1.233,
  1835: 1.358, 1836: 1.497, 1837: 1.574, 1838: 1.618, 1839: 1.685,
  1840: 1.590, 1841: 1.678, 1842: 1.646, 1843: 1.595, 1844: 1.741,
  1845: 1.899, 1846: 2.113, 1847: 2.476, 1848: 2.496, 1849: 2.488,
  1850: 2.656, 1851: 2.799, 1852: 3.143, 1853: 3.383, 1854: 3.789,
  1855: 4.048, 1856: 4.103, 1857: 4.241, 1858: 4.151, 1859: 4.475,
  1860: 4.410, 1861: 4.673, 1862: 5.881, 1863: 7.746, 1864: 9.600,
  1865: 10.012, 1866: 9.098, 1867: 8.465, 1868: 8.261, 1869: 8.009,
  1870: 7.899, 1871: 7.751, 1872: 8.402, 1873: 8.936, 1874: 8.659,
  1875: 8.331, 1876: 8.482, 1877: 8.700, 1878: 8.555, 1879: 9.555,
  1880: 10.592, 1881: 11.902, 1882: 12.519, 1883: 12.640, 1884: 12.107,
  1885: 11.925, 1886: 12.549, 1887: 13.565, 1888: 14.332, 1889: 14.338,
  1890: 15.607, 1891: 15.944, 1892: 16.920, 1893: 15.934, 1894: 14.606,
  1895: 16.114, 1896: 15.990, 1897: 16.666, 1898: 18.663, 1899: 20.119,
  1900: 21.197, 1901: 22.931, 1902: 24.754, 1903: 26.647, 1904: 26.360,
  1905: 29.523, 1906: 31.794, 1907: 34.639, 1908: 30.797, 1909: 32.540,
  1910: 33.746, 1911: 34.675, 1912: 37.745, 1913: 39.517, 1914: 36.831,
  1915: 39.048, 1916: 50.117, 1917: 60.278, 1918: 76.567, 1919: 79.090,
  1920: 89.246, 1921: 74.314, 1922: 74.140, 1923: 86.238, 1924: 87.786,
  1925: 91.449, 1926: 97.885, 1927: 96.466, 1928: 98.305, 1929: 104.556,
  1930: 92.160, 1931: 77.391, 1932: 59.522, 1933: 57.154, 1934: 66.800,
  1935: 74.241, 1936: 84.830, 1937: 93.003, 1938: 87.352, 1939: 93.437,
  1940: 102.899, 1941: 129.309, 1942: 165.952, 1943: 203.084, 1944: 224.447,
  1945: 228.007, 1946: 227.535, 1947: 249.616, 1948: 274.468, 1949: 272.475,
  1950: 299.827, 1951: 346.914, 1952: 367.341, 1953: 389.218, 1954: 390.549,
  1955: 425.478, 1956: 449.353, 1957: 474.039, 1958: 481.229, 1959: 521.654,
  1960: 542.382, 1961: 562.209, 1962: 603.922, 1963: 637.450, 1964: 684.460,
  1965: 742.289, 1966: 813.414, 1967: 859.959, 1968: 940.651, 1969: 1017.615,
  1970: 1073.303, 1971: 1164.850, 1972: 1279.110, 1973: 1425.376, 1974: 1545.243,
  1975: 1684.904, 1976: 1873.412, 1977: 2081.826, 1978: 2351.599, 1979: 2627.333,
  1980: 2857.307, 1981: 3207.041, 1982: 3343.789, 1983: 3634.038, 1984: 4037.613,
  1985: 4338.979, 1986: 4579.631, 1987: 4855.215, 1988: 5236.438, 1989: 5641.580,
  1990: 5963.144, 1991: 6158.129, 1992: 6520.327, 1993: 6858.559, 1994: 7287.236,
  1995: 7639.749, 1996: 8073.122, 1997: 8577.552, 1998: 9062.817, 1999: 9631.172,
  2000: 10250.952, 2001: 10581.929, 2002: 10929.108, 2003: 11456.450, 2004: 12217.196,
  2005: 13039.197, 2006: 13815.583, 2007: 14474.228, 2008: 14769.862, 2009: 14478.067,
  2010: 15048.971, 2011: 15599.732, 2012: 16253.970, 2013: 16880.683, 2014: 17608.138,
  2015: 18295.019, 2016: 18804.913, 2017: 19612.102, 2018: 20656.516, 2019: 21540.000,
  2020: 21375.300, 2021: 23315.100, 2022: 25471.400, 2023: 27040.000, 2024: 29300
};

/* US population decennial anchors (millions) — Census; exponential interpolation between */
const POP_DECENNIAL_M = {
  1790: 3.9, 1800: 5.3, 1810: 7.2, 1820: 9.6, 1830: 12.9,
  1840: 17.1, 1850: 23.2, 1860: 31.4, 1870: 38.6, 1880: 50.2,
  1890: 62.9, 1900: 76.2, 1910: 92.2, 1920: 106.0, 1930: 123.2,
  1940: 132.2, 1950: 151.3, 1960: 179.3, 1970: 203.3, 1980: 226.5,
  1990: 248.7, 2000: 281.4, 2010: 308.7, 2020: 331.4
};

/* Production / nonsupervisory hourly earnings (USD) — BLS, selected years */
const HOURLY_WAGE_USD = {
  1909: 0.19, 1914: 0.22, 1919: 0.47, 1924: 0.55, 1929: 0.57,
  1934: 0.53, 1939: 0.63, 1944: 1.02, 1949: 1.40, 1954: 1.78,
  1959: 2.19, 1964: 2.53, 1969: 3.19, 1974: 4.24, 1979: 6.34,
  1984: 8.32, 1989: 10.48, 1994: 11.74, 1999: 13.49, 2004: 16.15,
  2009: 18.62, 2014: 20.66, 2019: 23.51, 2024: 29.50
};

/* Selected representative prices to illustrate uneven inflation across categories */
const CATEGORY_CHANGES = [
  /* Got cheaper in real terms */
  { name: "Long-distance call (3 min, NY–LA)",     y1: 1960, p1: 3.00,   y2: 2024, p2: 0.001, kind: "cheaper",
    note: "Effectively zero over the internet." },
  { name: "Pocket calculator (basic 4-function)",  y1: 1972, p1: 395,    y2: 2024, p2: 5,     kind: "cheaper",
    note: "Now bundled free in every smartphone." },
  { name: "Color TV (entry-level)",                y1: 1960, p1: 500,    y2: 2024, p2: 200,   kind: "cheaper",
    note: "Cheaper in raw dollars; vastly cheaper per pixel." },
  { name: "Lighting (cost per lumen-hour)",        y1: 1900, p1: 1.00,   y2: 2024, p2: 0.001, kind: "cheaper",
    note: "≈1,000× drop in real terms (Nordhaus, 1996)." },
  { name: "Clothing (per garment, average)",       y1: 1960, p1: 25,     y2: 2024, p2: 25,    kind: "cheaper",
    note: "Apparel CPI has lagged general CPI for decades." },
  { name: "Air travel (per mile, coach)",          y1: 1960, p1: 0.06,   y2: 2024, p2: 0.14,  kind: "cheaper",
    note: "Cheaper in real terms after 1978 deregulation." },

  /* Got more expensive in real terms */
  { name: "Median home price (US)",                y1: 1960, p1: 11900,  y2: 2024, p2: 420000, kind: "expensive",
    note: "≈3.5× more in real terms; far more in coastal metros." },
  { name: "4-yr private college (tuition + fees)", y1: 1960, p1: 1450,   y2: 2024, p2: 60000,  kind: "expensive",
    note: "≈4× more in real terms (sticker; net is lower)." },
  { name: "Healthcare per capita (NHE)",           y1: 1960, p1: 146,    y2: 2024, p2: 14000,  kind: "expensive",
    note: "≈9× more in real terms." },
  { name: "Full-time childcare (urban)",           y1: 1985, p1: 3000,   y2: 2024, p2: 22000,  kind: "expensive",
    note: "≈3× more in real terms since 1985." },
  { name: "Top-tier concert ticket (face)",        y1: 1981, p1: 22,     y2: 2024, p2: 500,    kind: "expensive",
    note: "Live entertainment has sharply outpaced CPI." },
  { name: "New car (average transaction)",         y1: 1960, p1: 2600,   y2: 2024, p2: 48000,  kind: "expensive",
    note: "≈1.8× more in real terms (and far more capable)." }
];

/* ------------------- Helpers ------------------- */

function popForYearMillionsExp(y) {
  const years = Object.keys(POP_DECENNIAL_M).map(Number).sort((a, b) => a - b);
  if (y < years[0] || y > years[years.length - 1]) {
    if (y > years[years.length - 1]) {
      const last = years[years.length - 1];
      return POP_DECENNIAL_M[last] * Math.exp(Math.log(1.005) * (y - last));
    }
    return null;
  }
  if (POP_DECENNIAL_M[y]) return POP_DECENNIAL_M[y];
  let lo = years[0], hi = years[years.length - 1];
  for (let i = 0; i < years.length - 1; i++) {
    if (y >= years[i] && y <= years[i + 1]) { lo = years[i]; hi = years[i + 1]; break; }
  }
  const p0 = POP_DECENNIAL_M[lo], p1 = POP_DECENNIAL_M[hi];
  const t = (y - lo) / (hi - lo);
  return p0 * Math.exp(Math.log(p1 / p0) * t);
}

function gdpPerCapitaForYearUSD(y) {
  const gdpBn = GDP_LOOKUP_BN[y];
  const popM = popForYearMillionsExp(y);
  if (!gdpBn || !popM) return null;
  return (gdpBn * 1e9) / (popM * 1e6);
}

function wageForYear(y) {
  const years = Object.keys(HOURLY_WAGE_USD).map(Number).sort((a, b) => a - b);
  if (y < years[0]) return null;
  if (y >= years[years.length - 1]) return HOURLY_WAGE_USD[years[years.length - 1]];
  if (HOURLY_WAGE_USD[y] != null) return HOURLY_WAGE_USD[y];
  for (let i = 0; i < years.length - 1; i++) {
    if (y >= years[i] && y <= years[i + 1]) {
      const t = (y - years[i]) / (years[i + 1] - years[i]);
      return HOURLY_WAGE_USD[years[i]] + t * (HOURLY_WAGE_USD[years[i + 1]] - HOURLY_WAGE_USD[years[i]]);
    }
  }
  return null;
}

function fmtMoney(n, max = 0) {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: max });
}

function fmtCompact(n) {
  if (n == null || !isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (a >= 1e9)  return "$" + (n / 1e9).toFixed(a >= 1e10 ? 1 : 2) + "B";
  if (a >= 1e6)  return "$" + (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
  if (a >= 1e3)  return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + Math.round(n).toLocaleString();
}

function fmtNum(n, max = 0) {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

/* Animated counter — eases between values */
function useEased(target, duration = 600) {
  const [v, setV] = useState(target ?? 0);
  const startVal = useRef(target ?? 0);
  const startTime = useRef(0);
  const raf = useRef(0);
  useEffect(() => {
    if (target == null || !isFinite(target)) { setV(target); return; }
    startVal.current = v;
    startTime.current = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startTime.current) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setV(startVal.current + (target - startVal.current) * ease);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

/* ------------------- Main ------------------- */

const DEFAULT_LATEST_GDPPC = (() => {
  const pop2020 = POP_DECENNIAL_M[2020];
  const gdp2024 = GDP_LOOKUP_BN[2024] * 1e9;
  const pop2024 = pop2020 * Math.exp(Math.log(1.005) * 4);
  return Math.round(gdp2024 / (pop2024 * 1e6));
})();

function SliceIndexCalculator() {
  const [tab, setTab] = useState("single");
  const [amount, setAmount] = useState("75000");
  const [year, setYear] = useState(1939);
  const [rows, setRows] = useState([
    { year: 1942, amount: "10000000" },
    { year: 1943, amount: "150000000" },
    { year: 1944, amount: "930000000" },
    { year: 1945, amount: "859000000" }
  ]);
  const [latestGDPpc, setLatestGDPpc] = useState(DEFAULT_LATEST_GDPPC);
  const [latestWage, setLatestWage] = useState(HOURLY_WAGE_USD[2024]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customGDPpcYear, setCustomGDPpcYear] = useState("");
  const [customGDPpcValue, setCustomGDPpcValue] = useState("");
  const [customCPI, setCustomCPI] = useState("");

  useEffect(() => {
    function onLoadExample(ev) {
      if (!ev || !ev.detail) return;
      const d = ev.detail;
      if (d.amount != null) setAmount(String(d.amount));
      if (d.year != null) setYear(Number(d.year));
      setTab("single");
      const el = document.getElementById("calculator");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    window.addEventListener("loadExample", onLoadExample);
    return () => window.removeEventListener("loadExample", onLoadExample);
  }, []);

  const lenses = useMemo(() => {
    const latestCPI = CPI_U_ANNUAL[2024];
    const latestGDP = (GDP_LOOKUP_BN[2024] || 0) * 1e9;

    if (tab === "single") {
      const amt = Number(amount);
      if (!amt) return null;
      const usingOverrideGDP = customGDPpcValue !== "" && Number(customGDPpcYear) === year;
      const gdpPc = usingOverrideGDP ? Number(customGDPpcValue) : gdpPerCapitaForYearUSD(year);
      const cpi = customCPI !== "" ? Number(customCPI) : CPI_U_ANNUAL[year];
      const wage = wageForYear(year);
      const gdpThen = (GDP_LOOKUP_BN[year] || 0) * 1e9;

      const sliceYears   = gdpPc ? amt / gdpPc : null;
      const sliceToday   = sliceYears != null ? sliceYears * latestGDPpc : null;
      const cpiToday     = cpi ? amt * (latestCPI / cpi) : null;
      const hours        = wage ? amt / wage : null;
      const wageToday    = hours != null ? hours * latestWage : null;
      const gdpShare     = gdpThen ? amt / gdpThen : null;
      const gdpShareToday= gdpShare != null ? gdpShare * latestGDP : null;

      return { amt, gdpPc, cpi, wage, gdpThen,
        sliceYears, sliceToday, cpiToday, hours, wageToday, gdpShare, gdpShareToday };
    }
    let totalAmt = 0, sliceYears = 0, cpiToday = 0, hours = 0, gdpShare = 0;
    let cpiCovered = 0;
    for (const r of rows) {
      const amt = Number(r.amount);
      if (!amt) continue;
      totalAmt += amt;
      const pc = gdpPerCapitaForYearUSD(r.year);
      if (pc) sliceYears += amt / pc;
      const c = CPI_U_ANNUAL[r.year];
      if (c) { cpiToday += amt * (latestCPI / c); cpiCovered += amt; }
      const w = wageForYear(r.year);
      if (w) hours += amt / w;
      const gT = (GDP_LOOKUP_BN[r.year] || 0) * 1e9;
      if (gT) gdpShare += amt / gT;
    }
    if (!totalAmt) return null;
    return {
      amt: totalAmt,
      sliceYears, sliceToday: sliceYears * latestGDPpc,
      cpiToday: cpiToday || null,
      hours, wageToday: hours * latestWage,
      gdpShare, gdpShareToday: gdpShare * latestGDP,
      cpiCoverage: totalAmt ? cpiCovered / totalAmt : 1
    };
  }, [tab, amount, year, rows, customGDPpcYear, customGDPpcValue, customCPI, latestGDPpc, latestWage]);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <main className="max-w-5xl mx-auto px-6 pb-24">
        <section id="calculator" className="panel p-6 sm:p-8">
          <Tabs tab={tab} setTab={setTab} />
          {tab === "single" ? (
            <SingleInputs
              amount={amount} setAmount={setAmount}
              year={year} setYear={setYear}
              showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
              customGDPpcYear={customGDPpcYear} setCustomGDPpcYear={setCustomGDPpcYear}
              customGDPpcValue={customGDPpcValue} setCustomGDPpcValue={setCustomGDPpcValue}
              customCPI={customCPI} setCustomCPI={setCustomCPI}
            />
          ) : (
            <MultiInputs rows={rows} setRows={setRows} />
          )}
        </section>

        <LensResults lenses={lenses} tab={tab} year={year} />

        <WhatChangedSection />

        <ExamplesSection />

        <MethodologySection
          latestGDPpc={latestGDPpc} setLatestGDPpc={setLatestGDPpc}
          latestWage={latestWage} setLatestWage={setLatestWage}
        />

        <Footer />
      </main>
    </div>
  );
}

/* ------------------- Header / Hero ------------------- */

function Header() {
  return (
    <header className="sticky top-0 z-20 elev-bg backdrop-blur-md rule">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 no-underline" style={{ textDecoration: "none" }}>
          <SliceLogo size={22} />
          <span className="font-medium tracking-tight">SLICE Index</span>
          <span className="badge ml-1">beta</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <a href="#examples" className="btn-ghost" style={{ textDecoration: "none" }}>Examples</a>
          <a href="#changed" className="btn-ghost" style={{ textDecoration: "none" }}>What changed</a>
          <a href="#methodology" className="btn-ghost" style={{ textDecoration: "none" }}>Method</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
      <div className="pill mb-6"><span className="dot"></span>A multi-lens look at historical USD</div>
      <h1 className="serif text-5xl sm:text-6xl leading-[0.98] tracking-tight max-w-3xl font-medium">
        The changing meaning of a dollar.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed muted">
        Most calculators give you one number. But a 1960 dollar bought a long-distance
        call, a meal, and a sliver of a TV — three things that have moved in completely
        different directions since. SLICE compares four lenses side by side, so the
        disagreement is visible instead of hidden.
      </p>
    </section>
  );
}

/* ------------------- Calculator inputs ------------------- */

function Tabs({ tab, setTab }) {
  return (
    <div className="inline-flex p-1 rounded-xl mb-6" style={{ background: "rgba(17,17,17,0.04)" }}>
      <button onClick={() => setTab("single")} className={`tab ${tab === "single" ? "tab-on" : "tab-off"}`}>Single year</button>
      <button onClick={() => setTab("multi")}  className={`tab ${tab === "multi"  ? "tab-on" : "tab-off"}`}>Multi year</button>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs subtle mb-1.5 uppercase tracking-wider font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs subtle mt-1.5">{hint}</span>}
    </label>
  );
}

function SingleInputs(props) {
  const {
    amount, setAmount, year, setYear,
    showAdvanced, setShowAdvanced,
    customGDPpcYear, setCustomGDPpcYear,
    customGDPpcValue, setCustomGDPpcValue,
    customCPI, setCustomCPI
  } = props;

  const warnings = [];
  if (!CPI_U_ANNUAL[year] && customCPI === "") warnings.push("CPI series begins in 1913 — earlier years need an override to enable the CPI lens.");
  if (year > 2024) warnings.push("Year is past 2024 — built-in series end at 2024.");
  if (year < 1790) warnings.push("Year is before 1790 — GDP series begins in 1790.");

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Amount (USD)">
          <input type="number" inputMode="decimal" className="field text-lg display"
            value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="75,000" />
        </Field>
        <Field label="Year">
          <input type="number" min="1790" max="2024" className="field text-lg display"
            value={year} onChange={(e) => setYear(Number(e.target.value))} placeholder="1939" />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <button className="btn-ghost text-sm" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? "− Hide overrides" : "+ Add overrides"}
        </button>
        <span className="text-xs subtle">GDP 1790–2024 · CPI 1913–2024 · Wages 1909–2024</span>
      </div>

      {showAdvanced && (
        <div className="mt-4 grad rounded-2xl p-5">
          <div className="text-xs subtle mb-3 uppercase tracking-wider font-medium">Override built-in series for this year</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="GDP/cap year">
              <input type="number" className="field" value={customGDPpcYear}
                onChange={(e) => setCustomGDPpcYear(e.target.value)} placeholder={String(year)} />
            </Field>
            <Field label="GDP/cap value (USD)">
              <input type="number" className="field" value={customGDPpcValue}
                onChange={(e) => setCustomGDPpcValue(e.target.value)} placeholder="—" />
            </Field>
            <Field label="CPI for year (annual avg)">
              <input type="number" step="0.001" className="field" value={customCPI}
                onChange={(e) => setCustomCPI(e.target.value)} placeholder="—" />
            </Field>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 rounded-xl text-sm" style={{ background: "#fffaf0", color: "#5b3a00", border: "1px solid #f1d6a8", padding: "10px 14px" }}>
          <ul className="list-disc ml-5 space-y-1">{warnings.map((w, i) => (<li key={i}>{w}</li>))}</ul>
        </div>
      )}
    </div>
  );
}

function MultiInputs({ rows, setRows }) {
  function update(i, field, value) {
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: field === "year" ? Number(value) : value } : r));
  }
  function addRow() {
    const lastYear = rows.length ? rows[rows.length - 1].year : 1960;
    setRows([...rows, { year: lastYear + 1, amount: "0" }]);
  }
  return (
    <div>
      <p className="text-sm muted mb-4 max-w-2xl leading-relaxed">
        Enter year-by-year outlays for a multi-year program. Each row is run through every lens
        independently, then summed. Useful for projects like Apollo, Manhattan, or the Interstate.
      </p>
      <div className="overflow-auto -mx-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-2 text-xs subtle uppercase tracking-wider font-medium">Year</th>
              <th className="px-2 py-2 text-xs subtle uppercase tracking-wider font-medium">Amount (USD)</th>
              <th className="px-2 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="rule-soft">
                <td className="px-2 py-1.5">
                  <input type="number" className="field display" style={{ width: "8rem" }}
                    value={r.year} onChange={(e) => update(i, "year", e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input type="number" className="field display" style={{ width: "12rem" }}
                    value={r.amount} onChange={(e) => update(i, "amount", e.target.value)} />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button className="btn-ghost text-sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>Remove</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="3" className="px-2 py-8 text-center subtle text-sm">No rows yet — add one to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={addRow}>Add row</button>
        {rows.length > 0 && <button className="btn-ghost text-sm" onClick={() => setRows([])}>Clear all</button>}
      </div>
    </div>
  );
}

/* ------------------- Lens results ------------------- */

function LensResults({ lenses, tab, year }) {
  if (!lenses) {
    return (
      <section className="mt-8 panel p-10 text-center subtle">
        Enter an amount to see the lenses.
      </section>
    );
  }

  const lensList = [
    {
      key: "cpi",  name: "CPI uplift",   tag: "household basket",  today: lenses.cpiToday,
      desc: "What the same basket of consumer goods would cost today (BLS CPI-U).",
      detail: lenses.cpiToday != null ? "Includes housing, food, energy, services — averaged." : "Provide a CPI override for years before 1913."
    },
    {
      key: "wage", name: "Wage hours",   tag: "labor view",        today: lenses.wageToday,
      desc: "Hours of average production-worker labor it would take, valued at today's wage.",
      detail: lenses.hours != null ? fmtNum(lenses.hours) + " hours of average wage labor." : "Wage series begins in 1909."
    },
    {
      key: "slice", name: "SLICE",       tag: "share of average output", today: lenses.sliceToday,
      desc: "Person-years of national average output (GDP per capita), expressed in today's dollars.",
      detail: lenses.sliceYears != null ? fmtNum(lenses.sliceYears) + " person-years of average output." : null
    },
    {
      key: "gdp",  name: "GDP share",    tag: "macro scale",       today: lenses.gdpShareToday,
      desc: "The same fraction of nominal GDP, scaled to today's economy.",
      detail: lenses.gdpShare != null ? (lenses.gdpShare * 100).toLocaleString(undefined, { maximumFractionDigits: lenses.gdpShare > 0.001 ? 3 : 5 }) + "% of GDP that year." : null
    }
  ];

  const max = Math.max(0, ...lensList.map(l => l.today || 0));

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-5">
        <h2 className="serif text-3xl tracking-tight font-medium">Through four lenses</h2>
        <span className="text-sm subtle">Today equivalents (2024 USD basis)</span>
      </div>

      {/* Bar comparison */}
      <div className="panel p-6 sm:p-8 mb-6">
        <div className="space-y-5">
          {lensList.map((l) => {
            const w = (l.today != null && max > 0) ? Math.max(2, (l.today / max) * 100) : 0;
            return (
              <div key={l.key}>
                <div className="flex items-baseline justify-between mb-2 gap-3">
                  <div className="text-sm">
                    <span className="font-medium">{l.name}</span>
                    <span className="ml-2 subtle">{l.tag}</span>
                  </div>
                  <div className="display text-base">{l.today == null ? "—" : fmtCompact(l.today)}</div>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width: w + "%" }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-lens detail cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {lensList.map((l) => (
          <article key={l.key} className="lens-card panel p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium text-base">{l.name}</h3>
              <span className="text-xs subtle uppercase tracking-wider">{l.tag}</span>
            </div>
            <div className="mt-4 display text-3xl">{l.today == null ? "—" : fmtCompact(l.today)}</div>
            <p className="mt-3 text-sm muted leading-relaxed">{l.desc}</p>
            {l.detail && <div className="mt-3 text-xs subtle">{l.detail}</div>}
          </article>
        ))}
      </div>

      <div className="mt-6 panel p-6 grad">
        <div className="text-sm leading-relaxed muted">
          <span className="font-medium" style={{ color: "var(--ink)" }}>How to read this. </span>
          The lenses can disagree by an order of magnitude — that disagreement is the point.
          CPI tells you what households would pay; wage hours, what it cost in human labor;
          SLICE and GDP share, what fraction of national capacity an outlay represented.
          For personal income comparisons, CPI and wage hours are most apt. For projects (dams,
          weapons programs, infrastructure), SLICE and GDP share are more honest about scale.
        </div>
      </div>
    </section>
  );
}

/* ------------------- "What changed" categories ------------------- */

function WhatChangedSection() {
  const cheaper   = CATEGORY_CHANGES.filter(c => c.kind === "cheaper");
  const expensive = CATEGORY_CHANGES.filter(c => c.kind === "expensive");

  return (
    <section id="changed" className="mt-20">
      <div className="max-w-2xl">
        <h2 className="serif text-3xl tracking-tight font-medium">
          Some things got radically cheaper. Others got much more expensive.
        </h2>
        <p className="mt-4 text-base muted leading-relaxed">
          A single inflation number averages over wildly different categories. Goods that
          rode manufacturing scale and Moore's Law collapsed in price. Goods bound by land,
          time, or skilled human attention — housing, college, healthcare, childcare —
          outpaced wages. Both are true at once, which is why a single conversion can mislead.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <CategoryColumn title="Got cheaper in real terms"        items={cheaper}   kind="cheaper" />
        <CategoryColumn title="Got more expensive in real terms" items={expensive} kind="expensive" />
      </div>

      <p className="mt-4 text-xs subtle max-w-3xl">
        Real terms = nominal change adjusted by CPI for the relevant period. Items use
        representative anchor prices, not category-specific indices. Quality changes
        (a 2024 car vs. a 1960 car) are not adjusted for here.
      </p>
    </section>
  );
}

function realFactor(c) {
  const cpi1 = CPI_U_ANNUAL[c.y1];
  const cpi2 = CPI_U_ANNUAL[c.y2];
  if (!cpi1 || !cpi2 || !c.p1) return null;
  const cpiF = cpi2 / cpi1;
  return (c.p2 / c.p1) / cpiF;
}

function formatChange(c) {
  const r = realFactor(c);
  if (r == null) return "—";
  if (r === 0 || (c.p2 / c.p1) < 0.001) return "≈ free";
  if (r < 1) {
    const n = 1 / r;
    if (n >= 100) return "÷" + Math.round(n).toLocaleString();
    if (n >= 10)  return "÷" + n.toFixed(0);
    return "÷" + n.toFixed(1);
  }
  return r.toFixed(r >= 10 ? 0 : 1) + "×";
}

function CategoryColumn({ title, items, kind }) {
  const accent = kind === "cheaper" ? "var(--cheap)" : "var(--exp)";
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: "inline-block" }}></span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <ul>
        {items.map((c, i) => {
          const r = realFactor(c);
          const magnitude = r == null ? 0 : (r < 1 ? Math.min(1, 1 - r) : Math.min(1, Math.log10(r) / 1.3));
          const w = Math.max(6, magnitude * 100);
          return (
            <li key={i} className={`py-3 ${i > 0 ? "rule-soft" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="display text-sm" style={{ color: accent }}>{formatChange(c)}</div>
              </div>
              <div className="mt-2 bar" style={{ background: "rgba(17,17,17,0.04)" }}>
                <div className={`bar-fill ${kind === "cheaper" ? "cheap" : "exp"}`} style={{ width: w + "%" }} />
              </div>
              <div className="text-xs subtle mt-2">
                {c.y1}: {fmtMoney(c.p1, c.p1 < 1 ? 2 : 0)} → {c.y2}: {c.p2 < 0.01 ? "≈ $0" : fmtMoney(c.p2, c.p2 < 1 ? 2 : 0)}
                {c.note ? " · " + c.note : ""}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------- Examples ------------------- */

const EXAMPLES = [
  { title: "FDR's presidential salary",      year: 1939, amount: 75000,
    note: "$75K from 1909 to 1948. A test for the personal-income lenses." },
  { title: "Hoover Dam (midpoint)",           year: 1936, amount: 165000000,
    note: "≈$165M total. One year midpoint for a quick illustration." },
  { title: "Manhattan Project (peak year)",   year: 1944, amount: 930000000,
    note: "Single-year peak. Switch to Multi for the full $2B program." },
  { title: "Median home price, 1960",         year: 1960, amount: 11900,
    note: "Census median. Pairs with the housing item in 'What changed'." },
  { title: "First pocket calculator (HP-35)", year: 1972, amount: 395,
    note: "Now bundled free in every smartphone — every lens disagrees." },
  { title: "First-class postage stamp, 1932", year: 1932, amount: 0.03,
    note: "A small-purchase reference point for the deep past." }
];

function ExamplesSection() {
  return (
    <section id="examples" className="mt-20">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-5">
        <h2 className="serif text-3xl tracking-tight font-medium">Try a few</h2>
        <span className="text-sm subtle">A mix that exercises every lens</span>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {EXAMPLES.map((e, i) => <ExampleCard key={i} preset={e} />)}
      </div>
    </section>
  );
}

function ExampleCard({ preset }) {
  function load() {
    window.dispatchEvent(new CustomEvent("loadExample", { detail: preset }));
  }
  return (
    <article className="lens-card soft p-5 cursor-pointer" onClick={load}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") load(); }}>
      <h3 className="font-medium">{preset.title}</h3>
      <p className="text-sm muted mt-1.5 leading-relaxed">{preset.note}</p>
      <div className="mt-4 pt-4 rule-soft flex items-baseline justify-between text-sm">
        <div>
          <div className="display text-base">{fmtMoney(preset.amount, preset.amount < 1 ? 2 : 0)}</div>
          <div className="subtle text-xs mt-0.5">in {preset.year}</div>
        </div>
        <span className="btn-ghost text-sm">Load →</span>
      </div>
    </article>
  );
}

/* ------------------- Methodology ------------------- */

function MethodologySection({ latestGDPpc, setLatestGDPpc, latestWage, setLatestWage }) {
  return (
    <section id="methodology" className="mt-20">
      <h2 className="serif text-3xl tracking-tight font-medium mb-6">Methodology</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-6">
          <h3 className="font-medium text-base mb-4">The four lenses</h3>
          <dl className="text-sm space-y-4 muted leading-relaxed">
            <div>
              <dt className="font-medium" style={{ color: "var(--ink)" }}>CPI uplift</dt>
              <dd className="mt-0.5">Amount × (CPI<sub>2024</sub> ÷ CPI<sub>year</sub>). Standard household-basket reading; available 1913 onward. Hides large within-basket divergence (see "What changed").</dd>
            </div>
            <div>
              <dt className="font-medium" style={{ color: "var(--ink)" }}>Wage hours</dt>
              <dd className="mt-0.5">Amount ÷ hourly wage<sub>year</sub>, then × today's wage. Uses BLS production / nonsupervisory hourly earnings. Median wages have lagged GDP per capita since the 1970s, so this lens reads lower than SLICE.</dd>
            </div>
            <div>
              <dt className="font-medium" style={{ color: "var(--ink)" }}>SLICE — output share</dt>
              <dd className="mt-0.5">Amount ÷ GDP per capita<sub>year</sub>, then × today's GDP per capita. Reads as <span className="italic">person-years of average output</span>. Best for comparing the burden or scale of a project across centuries.</dd>
            </div>
            <div>
              <dt className="font-medium" style={{ color: "var(--ink)" }}>GDP share</dt>
              <dd className="mt-0.5">Amount ÷ nominal GDP<sub>year</sub>, then × today's nominal GDP. The "what fraction of the national economy" view. Best for very large projects.</dd>
            </div>
          </dl>
        </div>

        <div className="panel p-6">
          <h3 className="font-medium text-base mb-4">Honest limits</h3>
          <ul className="text-sm space-y-3 muted leading-relaxed">
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>No single lens is correct.</span> Different lenses answer different questions. Read them in combination.</li>
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>CPI is a basket average.</span> It hides huge divergence — calculators ÷100, college ×4, on the same chart.</li>
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>SLICE rises with productivity.</span> GDP per capita grows faster than CPI in the long run, so SLICE numbers will look larger by design.</li>
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>Quality changes are unpriced.</span> A 2024 car or TV is not a 1960 car or TV; hedonic adjustment is not applied here.</li>
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>Population is interpolated</span> exponentially between decennial census anchors — fine for trends, not for any single year.</li>
            <li><span className="font-medium" style={{ color: "var(--ink)" }}>USD only.</span> Other currencies need their own series.</li>
          </ul>
        </div>
      </div>

      <div className="panel p-6 mt-4">
        <h3 className="font-medium text-base mb-4">Today anchors</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Latest GDP per capita (USD)" hint="Used for the SLICE lens. Adjust to your preferred BEA vintage.">
            <input type="number" className="field display" value={latestGDPpc}
              onChange={(e) => setLatestGDPpc(Number(e.target.value))} />
          </Field>
          <Field label="Latest hourly wage (USD)" hint="Used for the wage-hours lens. BLS production / nonsupervisory.">
            <input type="number" step="0.01" className="field display" value={latestWage}
              onChange={(e) => setLatestWage(Number(e.target.value))} />
          </Field>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-6 text-sm muted">
        <div>
          <div className="font-medium mb-1" style={{ color: "var(--ink)" }}>GDP series</div>
          <div className="leading-relaxed">1790–2020: historical reconstructions (MeasuringWorth-class). 2021–2024: BEA current-dollar estimates.</div>
        </div>
        <div>
          <div className="font-medium mb-1" style={{ color: "var(--ink)" }}>Population</div>
          <div className="leading-relaxed">US Census decennial counts. Annual values are exponentially interpolated between anchors.</div>
        </div>
        <div>
          <div className="font-medium mb-1" style={{ color: "var(--ink)" }}>CPI &amp; wages</div>
          <div className="leading-relaxed">BLS CPI-U annual averages (1913+) and production / nonsupervisory hourly earnings (selected years).</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------- Footer ------------------- */

function Footer() {
  return (
    <footer className="mt-20 pt-8 rule">
      <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm muted">
        <div>
          Built by <a href="https://michaelsienko.com">Michael Sienko</a>.{" "}
          <span className="subtle">Beta — series subject to revision; verify before quoting.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="mailto:michael@sienko.xyz?subject=SLICE%20Index%20feedback">Feedback</a>
        </div>
      </div>
    </footer>
  );
}

/* expose component */
window.SliceIndexCalculator = SliceIndexCalculator;
