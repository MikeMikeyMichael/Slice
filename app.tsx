/* SLICE Index Calculator (USD only) */
const { useMemo, useState } = React;

function SliceLogo({ size = 28 }: { size?: number }) {
  const stroke = "#0f172a";
  const fill = "#111827";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="translate(32,32)">
        <circle cx="0" cy="0" r="28" fill="none" stroke={stroke} strokeWidth="2"/>
        <path d="M0,0 L0,-26 A26,26 0 0 1 10.05,-24.1 Z" fill={fill} />
        <circle cx="0" cy="0" r="1.6" fill={stroke} />
      </g>
    </svg>
  );
}

/* CPI-U annual average (1913..2024 provisional) */
const CPI_U_ANNUAL: Record<number, number> = {
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

/* Nominal GDP 1790..2024, billions USD */
const GDP_LOOKUP_BN: Record<number, number> = {
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

/* US population decennial anchors (millions). Linear interpolation for annual. */
const POP_DECENNIAL_M: Record<number, number> = {
  1790: 3.9, 1800: 5.3, 1810: 7.2, 1820: 9.6, 1830: 12.9,
  1840: 17.1, 1850: 23.2, 1860: 31.4, 1870: 38.6, 1880: 50.2,
  1890: 62.9, 1900: 76.2, 1910: 92.2, 1920: 106.0, 1930: 123.2,
  1940: 132.2, 1950: 151.3, 1960: 179.3, 1970: 203.3, 1980: 226.5,
  1990: 248.7, 2000: 281.4, 2010: 308.7, 2020: 331.4
};

function popForYearMillions(y: number): number | null {
  if (POP_DECENNIAL_M[y]) return POP_DECENNIAL_M[y];
  const years = Object.keys(POP_DECENNIAL_M).map(Number).sort((a,b)=>a-b);
  if (y < years[0] || y > years[years.length-1]) return null;
  let lo = years[0], hi = years[years.length-1];
  for (let i=0; i<years.length-1; i++) {
    if (y >= years[i] && y <= years[i+1]) { lo = years[i]; hi = years[i+1]; break; }
  }
  const pLo = POP_DECENNIAL_M[lo], pHi = POP_DECENNIAL_M[hi];
  const t = (y - lo) / (hi - lo);
  return pLo + t * (pHi - pLo);
}

function gdpPerCapitaForYearUSD(y: number): number | null {
  const gdpBn = GDP_LOOKUP_BN[y];
  const popM = popForYearMillions(y);
  if (!gdpBn || !popM) return null;
  return (gdpBn * 1_000_000_000) / (popM * 1_000_000);
}

/* Trend GDP fit using prior 10y log-linear */
function trendGDPbn(year: number, windowYears = 10): number | null {
  const years: number[] = [];
  const logs: number[] = [];
  for (let y = year - windowYears; y <= year - 1; y++) {
    const v = GDP_LOOKUP_BN[y];
    if (v && v > 0) { years.push(y); logs.push(Math.log(v)); }
  }
  if (years.length < 3) return null;
  const n = years.length;
  const meanX = years.reduce((a, b) => a + b, 0) / n;
  const meanY = logs.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { const dx = years[i] - meanX; num += dx * (logs[i] - meanY); den += dx * dx; }
  const b = den === 0 ? 0 : num / den;
  const a = meanY - b * meanX;
  const predLog = a + b * year;
  return Math.exp(predLog);
}

function prettyMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function pct(n: number) {
  return (n * 100).toLocaleString(undefined, { maximumFractionDigits: 3 }) + "%";
}

function SliceIndexCalculator() {
  const [tab, setTab] = useState<"single" | "multi">("single");
  const [amount, setAmount] = useState<string>("15000000");
  const [year, setYear] = useState<number>(1803);
  const [rows, setRows] = useState<{ year: number; amount: string }[]>([
    { year: 1942, amount: "60000000" },
    { year: 1943, amount: "490000000" },
    { year: 1944, amount: "930000000" },
    { year: 1945, amount: "520000000" }
  ]);
  const [latestGDPbn, setLatestGDPbn] = useState<number>(GDP_LOOKUP_BN[2024]);
  const [latestPopM, setLatestPopM] = useState<number>(331.4);
  const [customGDPbn, setCustomGDPbn] = useState<string>("");
  const [customCPI, setCustomCPI] = useState<string>("");
  const [denom, setDenom] = useState<"actual" | "trend">("actual");
  const [basis, setBasis] = useState<"gdp" | "gdppc">("gdppc");

  const gdpForYearBn = useMemo(() => customGDPbn !== "" ? Number(customGDPbn) : GDP_LOOKUP_BN[year], [year, customGDPbn]);
  const gdpPcForYear = useMemo(() => gdpPerCapitaForYearUSD(year), [year]);
  const latestGDPpc = useMemo(() => (latestGDPbn && latestPopM) ? (latestGDPbn * 1_000_000_000) / (latestPopM * 1_000_000) : null, [latestGDPbn, latestPopM]);
  const cpiForYear = useMemo(() => customCPI !== "" ? Number(customCPI) : CPI_U_ANNUAL[year as keyof typeof CPI_U_ANNUAL], [year, customCPI]);
  const latestCPI = CPI_U_ANNUAL[2024];

  // Single-year SLICE
  const singleSliceShare = useMemo(() => {
    const amt = Number(amount);
    if (!amt) return null;
    if (basis === "gdp") {
      const base = denom === "actual" ? gdpForYearBn : trendGDPbn(year) ?? gdpForYearBn;
      if (!base) return null;
      return amt / (base * 1_000_000_000);
    } else {
      const pc = gdpPcForYear;
      if (!pc) return null;
      return amt / pc; // person-years
    }
  }, [amount, year, gdpForYearBn, gdpPcForYear, denom, basis]);

  const singleSliceToday = useMemo(() => {
    if (singleSliceShare == null) return null;
    if (basis === "gdp") return singleSliceShare * (latestGDPbn * 1_000_000_000);
    if (!latestGDPpc) return null;
    return singleSliceShare * latestGDPpc;
  }, [singleSliceShare, latestGDPbn, latestGDPpc, basis]);

  // CPI uplift for single-year
  const cpiToday = useMemo(() => {
    const amt = Number(amount);
    if (!amt) return null;
    if (!cpiForYear || !latestCPI) return null;
    return amt * (latestCPI / cpiForYear);
  }, [amount, cpiForYear, latestCPI]);

  // Multi-year SLICE
  const multiSliceShare = useMemo(() => {
    let sum = 0;
    for (const r of rows) {
      const amt = Number(r.amount);
      if (!amt) continue;
      if (basis === "gdp") {
        const base = denom === "actual" ? GDP_LOOKUP_BN[r.year] : trendGDPbn(r.year) ?? GDP_LOOKUP_BN[r.year];
        if (!base) continue;
        sum += amt / (base * 1_000_000_000);
      } else {
        const pc = gdpPerCapitaForYearUSD(r.year);
        if (!pc) continue;
        sum += amt / pc; // person-years
      }
    }
    return sum;
  }, [rows, denom, basis]);

  const multiSliceToday = useMemo(() => {
    if (basis === "gdp") return multiSliceShare * (latestGDPbn * 1_000_000_000);
    if (!latestGDPpc) return 0;
    return multiSliceShare * latestGDPpc;
  }, [multiSliceShare, latestGDPbn, latestGDPpc, basis]);

  // Multipliers and differences
  const basePastTotal = useMemo(() => {
    if (tab === "single") {
      const a = Number(amount);
      return isFinite(a) ? a : 0;
    }
    return rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  }, [tab, amount, rows]);

  const sliceMultiple = useMemo(() => {
    if (!basePastTotal) return null;
    const todayVal = tab === "single" ? (singleSliceToday || 0) : (multiSliceToday || 0);
    const val = todayVal / basePastTotal;
    return isFinite(val) && val > 0 ? val : null;
  }, [tab, basePastTotal, singleSliceToday, multiSliceToday]);

  const cpiMultiple = useMemo(() => {
    if (tab !== "single") return null;
    if (!basePastTotal || cpiToday == null) return null;
    const val = cpiToday / basePastTotal;
    return isFinite(val) && val > 0 ? val : null;
  }, [tab, basePastTotal, cpiToday]);

  const diffMultiple = useMemo(() => {
    if (sliceMultiple == null || cpiMultiple == null) return null;
    return sliceMultiple - cpiMultiple;
  }, [sliceMultiple, cpiMultiple]);

  const dollarDiff = useMemo(() => {
    if (tab !== "single") return null;
    if (singleSliceToday == null || cpiToday == null) return null;
    return singleSliceToday - cpiToday;
  }, [tab, singleSliceToday, cpiToday]);

  const warnings: string[] = [];
  if (tab === "single") {
    if (!GDP_LOOKUP_BN[year] && customGDPbn === "") warnings.push("No built-in GDP for this year. Enter GDP in billions.");
    if (!CPI_U_ANNUAL[year] && customCPI === "") warnings.push("No CPI for this year. Add CPI to enable CPI comparison.");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SliceLogo size={28} />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">SLICE Index <span className="ml-2 align-middle text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">beta</span></h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <span className="hidden sm:inline">Latest GDP (billions)</span>
              <input type="number" className="w-28 rounded-xl border border-slate-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-300" value={latestGDPbn} onChange={(e) => setLatestGDPbn(Number(e.target.value))} />
            </label>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Denominator</span>
              <label className="inline-flex items-center gap-1"><input type="radio" name="den" checked={denom === "actual"} onChange={() => setDenom("actual")} /> <span>Actual</span></label>
              <label className="inline-flex items-center gap-1"><input type="radio" name="den" checked={denom === "trend"} onChange={() => setDenom("trend")} /> <span>Trend</span></label>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Basis</span>
              <label className="inline-flex items-center gap-1"><input type="radio" name="basis" checked={basis === "gdp"} onChange={() => setBasis("gdp")} /> <span>Total GDP</span></label>
              <label className="inline-flex items-center gap-1"><input type="radio" name="basis" checked={basis === "gdppc"} onChange={() => setBasis("gdppc")} /> <span>GDP per capita</span></label>
            </div>
            <label className="inline-flex items-center gap-2">
              <span className="hidden sm:inline">Latest population (millions)</span>
              <input type="number" className="w-28 rounded-xl border border-slate-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-300" value={latestPopM} onChange={(e) => setLatestPopM(Number(e.target.value))} />
            </label>
            <span className="text-slate-500">USD only</span>
            <a
              href="mailto:michael@sienko.xyz?subject=SLICE%20Index%20paper%20updates&body=Hi%20Michael%2C%0A%0APlease%20add%20me%20to%20updates%20for%20the%20SLICE%20Index%20paper.%0A%0AName%3A%20%5BYour%20name%5D%0AAffiliation%3A%20%5BYour%20org%5D%0AUse%20case%3A%20%5BBrief%5D%0A%0AThank%20you!"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1 hover:bg-slate-50"
            >Get paper updates</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 inline-flex rounded-xl border border-slate-100 overflow-hidden bg-white/60">
          <button onClick={() => setTab("single")} className={`px-4 py-2 text-sm ${tab === "single" ? "bg-slate-900 text-white" : "bg-white"}`}>Single year</button>
          <button onClick={() => setTab("multi")} className={`px-4 py-2 text-sm ${tab === "multi" ? "bg-slate-900 text-white" : "bg-white"}`}>Multi year</button>
        </div>

        {tab === "single" ? (
          <SingleInputs
            amount={amount}
            year={year}
            setAmount={setAmount}
            setYear={setYear}
            customGDPbn={customGDPbn}
            setCustomGDPbn={setCustomGDPbn}
            customCPI={customCPI}
            setCustomCPI={setCustomCPI}
            warnings={warnings}
            singleSliceShare={singleSliceShare}
            singleSliceToday={singleSliceToday}
            cpiToday={cpiToday}
          />
        ) : (
          <MultiInputs rows={rows} setRows={setRows} />
        )}

        <ResultsGrid
          sliceShare={tab === "single" ? singleSliceShare ?? 0 : multiSliceShare}
          sliceToday={tab === "single" ? singleSliceToday ?? 0 : multiSliceToday}
          cpiToday={tab === "single" ? cpiToday : null}
          sliceMultiple={sliceMultiple}
          cpiMultiple={cpiMultiple}
          diffMultiple={diffMultiple}
          dollarDiff={dollarDiff}
          basis={basis}
        />

        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Methodology summary</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-medium">SLICE Index</span> measures historical burden. For a single year amount A in year y with GDP Y_y, SLICE = A / Y_y. For multi year projects, compute Σ(A_t / Y_t). To express a today equivalent, multiply the SLICE share by the latest GDP. On a GDP per capita basis, divide A by GDP per capita for each year to get person-years, then multiply by the latest GDP per capita to express a today equivalent.</p>
            <p><span className="font-medium">Denominator</span>: Actual uses recorded nominal GDP. Trend uses a simple log-linear fit on the prior ten years to remove temporary surges. When trend is not computable the app falls back to actual.</p>
            <p><span className="font-medium">CPI uplift</span> is a consumer affordability lens. It does not measure project scale.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mt-5">
            <div>
              <h3 className="font-semibold mb-1">Limits</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>USD only. CPI series begins in 1913. Pre-1913 CPI requires a user value.</li>
                <li>SLICE is a burden measure. It is not a replication estimator.</li>
                <li>Population is linearly interpolated between decennial counts.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Data sources and vintages</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>GDP 1790 to 2020: MeasuringWorth nominal GDP. 2021 to 2023: BEA current dollar. 2024 editable.</li>
                <li>CPI-U 1913 to 2024: BLS annual averages. 2024 provisional.</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-1">When to use which</h3>
              <p>Affordability uses CPI. Burden and scale use SLICE. Capability today requires an engineering estimate.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How to cite</h3>
              <p>SLICE Index calculator, version 0.3 beta. Methodology per the working paper "The SLICE Index: Measuring Historical Project Scale by Economic Burden".</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Feedback</h3>
              <p>This is a beta. Double check numbers and <a href="mailto:michael@sienko.xyz" className="underline">email Michael</a>.</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Quick examples</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ExampleCard title="Hoover Dam (midpoint 1936)" preset={{ amount: 165_000_000, year: 1936, note: "Often quoted total near 165m. One-year midpoint for illustration." }} onApply={(p) => { setTab("single"); setAmount(String(p.amount)); setYear(p.year); setCustomGDPbn(""); setCustomCPI(""); }} />
            <ExampleCard title="Alaska Purchase (1867)" preset={{ amount: 7_200_000, year: 1867, note: "Clean single-year outlay. CPI not available, so SLICE highlights burden." }} onApply={(p) => { setTab("single"); setAmount(String(p.amount)); setYear(p.year); setCustomGDPbn(""); setCustomCPI(""); }} />
            <ExampleCard title="Louisiana Purchase (1803)" preset={{ amount: 15_000_000, year: 1803, note: "Cash price illustration. Bonds and interest extend across years." }} onApply={(p) => { setTab("single"); setAmount(String(p.amount)); setYear(p.year); setCustomGDPbn(""); setCustomCPI(""); }} />
          </div>
        </section>

        <footer className="mt-10 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <p><span className="font-semibold">Beta disclaimer</span>: This calculator is in beta. Always verify figures against your preferred sources and read the methodology. Series can be revised.</p>
          <p className="mt-2">Built for clarity: SLICE measures burden. CPI measures household affordability. Capability today requires engineering.</p>
          <p className="mt-2">Built by <a className="underline" href="https://michaelsienko.xyz">Michael Sienko</a>.</p>
        </footer>
      </main>
    </div>
  );
}

/* Single year inputs */
function SingleInputs(props: any) {
  const { amount, year, setAmount, setYear, customGDPbn, setCustomGDPbn, customCPI, setCustomCPI, warnings, singleSliceShare, singleSliceToday, cpiToday } = props;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Enter an amount and a year</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">Amount (USD)</span>
          <input type="number" inputMode="decimal" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 15000000" />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">Year</span>
          <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" value={year} onChange={(e) => setYear(Number(e.target.value))} placeholder="e.g., 1803" />
        </label>
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="block text-sm text-slate-600 mb-1">Override GDP for year (billions)</span>
            <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" value={customGDPbn} onChange={(e) => setCustomGDPbn(e.target.value)} placeholder={GDP_LOOKUP_BN[year] ? String(GDP_LOOKUP_BN[year]) : "required if unknown"} />
          </label>
          <label className="block">
            <span className="block text-sm text-slate-600 mb-1">Override CPI for year (annual avg)</span>
            <input type="number" step="0.001" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" value={customCPI} onChange={(e) => setCustomCPI(e.target.value)} placeholder={CPI_U_ANNUAL[year] ? String(CPI_U_ANNUAL[year]) : "optional"} />
          </label>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <ul className="list-disc ml-5">{warnings.map((w: string, i: number) => (<li key={i}>{w}</li>))}</ul>
        </div>
      )}
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600">SLICE share</div>
          <div className="text-2xl font-bold">{singleSliceShare == null ? "--" : (typeof singleSliceShare === "number" ? singleSliceShare : "--")}</div>
          <div className="text-xs text-slate-500 mt-1">Shown as percent in Total GDP mode, as person-years in GDP per capita mode in the SLICE card below.</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600">SLICE today equivalent</div>
          <div className="text-xl font-semibold">{singleSliceToday == null ? "--" : prettyMoney(singleSliceToday)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600">CPI uplift</div>
          <div className="text-xl font-semibold">{cpiToday == null ? "--" : prettyMoney(cpiToday)}</div>
        </div>
      </div>
    </div>
  );
}

/* Multi-year inputs */
function MultiInputs({ rows, setRows }: { rows: { year: number; amount: string }[]; setRows: any }) {
  function updateRow(i: number, field: "year" | "amount", value: string) {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: field === "year" ? Number(value) : value } : r);
    setRows(next);
  }
  function addRow() { setRows([...rows, { year: 1966, amount: "0" }]); }
  function removeRow(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold mb-3">Enter year by year outlays</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-3">Year</th>
              <th className="py-2 pr-3">Amount (USD)</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="py-2 pr-3"><input type="number" className="w-24 rounded-xl border border-slate-300 px-2 py-1" value={r.year} onChange={(e) => updateRow(i, "year", e.target.value)} /></td>
                <td className="py-2 pr-3"><input type="number" className="w-40 rounded-xl border border-slate-300 px-2 py-1" value={r.amount} onChange={(e) => updateRow(i, "amount", e.target.value)} /></td>
                <td className="py-2 pr-3"><button className="px-2 py-1 border rounded-lg" onClick={() => removeRow(i)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 border rounded-lg" onClick={addRow}>Add row</button>
        <button className="px-3 py-1 border rounded-lg" onClick={() => setRows([])}>Clear</button>
      </div>
      <p className="text-xs text-slate-600 mt-2">Paste annual outlays, then read the SLICE box below. The app sums Σ(A_t / Y_t) using the selected basis and denominator.</p>
    </div>
  );
}

/* Results */
function ResultsGrid({ sliceShare, sliceToday, cpiToday, sliceMultiple, cpiMultiple, diffMultiple, dollarDiff, basis }:
  { sliceShare: number; sliceToday: number; cpiToday: number | null; sliceMultiple: number | null; cpiMultiple: number | null; diffMultiple: number | null; dollarDiff: number | null; basis: "gdp" | "gdppc" }) {
  const mainValue = sliceShare == null ? "--" : (basis === "gdp" ? pct(sliceShare as number) : (sliceShare as number).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " person-years");
  return (
    <div className="grid lg:grid-cols-3 gap-4 items-start">
      <div className="bg-white/80 rounded-2xl border-0 shadow-none p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-2">SLICE Index</h3>
        <div className="text-3xl font-bold tracking-tight">{mainValue}</div>
        <p className="text-sm text-slate-600 mt-1">{basis === "gdp" ? "Share of one year of output, summed across selected years if multi year." : "Equivalent person-years of average output, summed across years."}</p>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">Today equivalent via {basis === "gdp" ? "SLICE (total GDP)" : "SLICE per capita"}</div>
          <div className="text-xl font-semibold">{isFinite(sliceToday) ? prettyMoney(sliceToday) : "--"}</div>
          <div className="mt-2 text-xs text-slate-500">SLICE multiple: {sliceMultiple == null ? "--" : sliceMultiple.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "x"} per past dollar</div>
        </div>
      </div>
      <div className="bg-white/80 rounded-2xl border-0 shadow-none p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-2">CPI uplift</h3>
        {cpiToday == null ? <p className="text-slate-500 text-sm">CPI not available for the reference year or not provided.</p> : (
          <div>
            <div className="text-xl font-semibold">{prettyMoney(cpiToday)}</div>
            <p className="text-sm text-slate-600 mt-1">Household affordability view using CPI-U annual average.</p>
          </div>
        )}
        <div className="mt-4 text-xs text-slate-500">
          CPI compares household purchasing power. It does not measure project scale.
          <br />CPI multiple: {cpiMultiple == null ? "--" : cpiMultiple.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "x"} per past dollar
          {dollarDiff == null ? null : (
            <div className="mt-1">SLICE minus CPI: {diffMultiple == null ? "--" : diffMultiple.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "x"} ({prettyMoney(dollarDiff)})</div>
          )}
        </div>
      </div>
      <div className="bg-white/80 rounded-2xl border-0 shadow-none p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-2">Context</h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li><span className="font-medium">SLICE</span> answers: how large it was relative to the economy then.</li>
          <li><span className="font-medium">CPI</span> answers: what a household would need today to buy the same basket.</li>
          <li>Trend denominator uses a ten year log-linear fit prior to each year.</li>
        </ul>
        <div className="mt-4 text-xs text-slate-500">Keep latest GDP and population current. They control the today-equivalent.</div>
      </div>
    </div>
  );
}

/* Example cards */
function ExampleCard({ title, preset, onApply }: { title: string, preset: { amount: number, year: number, note?: string }, onApply: (p: { amount: number, year: number }) => void }) {
  return (
    <div className="bg-white/80 rounded-2xl border-0 shadow-none p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{preset.note}</p>
      <div className="flex items-center justify-between text-sm">
        <div>
          <div>Amount: <span className="font-medium">{prettyMoney(preset.amount)}</span></div>
          <div>Year: <span className="font-medium">{preset.year}</span></div>
        </div>
        <button className="rounded-xl border border-slate-300 px-3 py-1 hover:bg-slate-50" onClick={() => onApply(preset)}>Load</button>
      </div>
    </div>
  );
}

// expose globally
// @ts-ignore
window.SliceIndexCalculator = SliceIndexCalculator;
