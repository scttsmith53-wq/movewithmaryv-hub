'use client';

/**
 * Sale Proceeds — co-branded member-portal calculator.
 * Mary Vega (agent) + Scott Smith / Citywide (lender). Light "premium" design.
 * Prefill from the valuation flow via URL params: ?value=525000&payoff=310000&state=AZ
 */

import { useEffect, useState } from 'react';
import { money, num } from '@/lib/calc-format';
import {
  hubName,
  hubTagline,
  agentInitials,
  agentName,
  agentTitle,
  agentBrokerage,
  lenderInitials,
  lenderName,
  lenderTitle,
  lenderCompany,
  lenderNmls,
  coBrandDisclosure,
} from '@/lib/content';

const STATES: Record<string, { closing: number; label: string }> = {
  AZ: { closing: 2.0, label: 'Estimated Arizona transaction costs. Actual title, tax, HOA and escrow charges vary.' },
};

export default function SaleProceedsPage() {
  const [state, setState] = useState('AZ');
  const [salePrice, setSalePrice] = useState(525000);
  const [mortgage, setMortgage] = useState(310000);
  const [secondLien, setSecondLien] = useState(0);
  const [otherPayoff, setOtherPayoff] = useState(0);
  const [servicePct, setServicePct] = useState(5.0);
  const [closingPct, setClosingPct] = useState(2.0);
  const [buyerHelp, setBuyerHelp] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  // Prefill from the valuation flow (client-only, avoids useSearchParams Suspense).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has('value')) setSalePrice(num(p.get('value') || ''));
    if (p.has('payoff')) setMortgage(num(p.get('payoff') || ''));
    const s = (p.get('state') || '').toUpperCase();
    if (s && STATES[s]) {
      setState(s);
      setClosingPct(STATES[s].closing);
    }
  }, []);

  const payoffs = mortgage + secondLien + otherPayoff;
  const services = salePrice * (servicePct / 100);
  const closing = salePrice * (closingPct / 100);
  const variable = buyerHelp + otherCosts;
  const expenses = services + closing + variable;
  const net = salePrice - payoffs - expenses;

  const onNum = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setter(e.target.value === '' ? 0 : num(e.target.value));

  const scrollNext = () =>
    document.getElementById('nextHome')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="sp-root">
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">{agentInitials}</div>
            <div>
              <strong>{hubName}</strong>
              <span>{hubTagline}</span>
            </div>
          </div>
          <nav className="nav">
            <a href="#">Overview</a>
            <a href="#">Home Value</a>
            <a href="#" className="active">Sale Proceeds</a>
            <a href="#nextHome" onClick={(e) => { e.preventDefault(); scrollNext(); }}>Next Home</a>
            <a href="#">My Plan</a>
            <a href="#">Resources</a>
          </nav>
          <div className="side-bottom">
            Co-branded by {agentName} &amp; {lenderName}.
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <div className="crumb">YOUR HOME &nbsp; / &nbsp; SALE PROCEEDS</div>
            <div className="team">
              <div className="avatars">
                <div className="avatar" title={agentName}>{agentInitials}</div>
                <div className="avatar" title={lenderName}>{lenderInitials}</div>
              </div>
              <span>Your real estate + lending team</span>
            </div>
          </header>

          <div className="content">
            <div className="eyebrow">Your equity picture</div>
            <h1>See what you could walk away with.</h1>
            <p className="intro">
              Your home&rsquo;s value is only part of the story. Add what you still owe and we&rsquo;ll
              estimate what may be available after the sale to help fund whatever comes next.
            </p>

            <div className="grid">
              {/* Inputs */}
              <section className="card">
                <div className="card-inner">
                  <div className="card-title">Your sale estimate</div>
                  <div className="card-sub">
                    We&rsquo;ve started with your estimated home value. Adjust anything that looks different.
                  </div>

                  <div className="form-grid">
                    <div className="field state-row">
                      <label htmlFor="state">Property location</label>
                      <select id="state" value={state} onChange={(e) => {
                        const s = e.target.value;
                        setState(s);
                        if (STATES[s]) setClosingPct(STATES[s].closing);
                      }}>
                        <option value="AZ">Arizona</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="salePrice">Estimated sale price</label>
                      <div className="input-wrap">
                        <span className="prefix">$</span>
                        <input id="salePrice" type="number" min={0} step={1000}
                          value={Number.isFinite(salePrice) ? salePrice : ''} onChange={onNum(setSalePrice)} />
                      </div>
                      <div className="help">Prefilled from your home-value estimate.</div>
                    </div>

                    <div className="field">
                      <label htmlFor="mortgage">What do you still owe?</label>
                      <div className="input-wrap">
                        <span className="prefix">$</span>
                        <input id="mortgage" type="number" min={0} step={1000}
                          value={Number.isFinite(mortgage) ? mortgage : ''} onChange={onNum(setMortgage)} />
                      </div>
                      <div className="help">A recent mortgage statement is close enough for planning.</div>
                    </div>

                    <div className="field">
                      <label htmlFor="secondLien">HELOC or second mortgage</label>
                      <div className="input-wrap">
                        <span className="prefix">$</span>
                        <input id="secondLien" type="number" min={0} step={500}
                          value={Number.isFinite(secondLien) ? secondLien : ''} onChange={onNum(setSecondLien)} />
                      </div>
                      <div className="help">Leave at $0 if you don&rsquo;t have one.</div>
                    </div>

                    <div className="field">
                      <label htmlFor="otherPayoff">Other property payoff</label>
                      <div className="input-wrap">
                        <span className="prefix">$</span>
                        <input id="otherPayoff" type="number" min={0} step={500}
                          value={Number.isFinite(otherPayoff) ? otherPayoff : ''} onChange={onNum(setOtherPayoff)} />
                      </div>
                      <div className="help">Optional HOA balance, lien, or known payoff item.</div>
                    </div>
                  </div>

                  <div className="assumptions">
                    <button
                      type="button"
                      className={`assumptions-toggle${assumptionsOpen ? ' open' : ''}`}
                      onClick={() => setAssumptionsOpen((v) => !v)}
                    >
                      <span>See or adjust selling-expense assumptions</span>
                      <span>+</span>
                    </button>

                    <div className={`assumptions-panel${assumptionsOpen ? ' show' : ''}`}>
                      <div className="assumption-row">
                        <div className="assumption-copy">
                          <strong>Real estate services</strong>
                          <span>Planning estimate only. Compensation is negotiable and may be different for your actual sale.</span>
                        </div>
                        <div className="small-input">
                          <input type="number" min={0} max={10} step={0.1}
                            value={Number.isFinite(servicePct) ? servicePct : ''} onChange={onNum(setServicePct)} />
                          <span className="suffix">%</span>
                        </div>
                      </div>

                      <div className="assumption-row">
                        <div className="assumption-copy">
                          <strong>Title, escrow &amp; typical closing costs</strong>
                          <span>{STATES[state]?.label}</span>
                        </div>
                        <div className="small-input">
                          <input type="number" min={0} max={10} step={0.1}
                            value={Number.isFinite(closingPct) ? closingPct : ''} onChange={onNum(setClosingPct)} />
                          <span className="suffix">%</span>
                        </div>
                      </div>

                      <div className="assumption-row">
                        <div className="assumption-copy">
                          <strong>Possible buyer closing-cost assistance</strong>
                          <span>Starts at $0. Add an amount only if you want to model a negotiated seller contribution.</span>
                        </div>
                        <div className="small-input dollar-small">
                          <span className="prefix">$</span>
                          <input type="number" min={0} step={500}
                            value={Number.isFinite(buyerHelp) ? buyerHelp : ''} onChange={onNum(setBuyerHelp)} />
                        </div>
                      </div>

                      <div className="assumption-row">
                        <div className="assumption-copy">
                          <strong>Repairs / other sale expenses</strong>
                          <span>Optional planning amount for repairs, home warranty, moving-related sale costs, or other items.</span>
                        </div>
                        <div className="small-input dollar-small">
                          <span className="prefix">$</span>
                          <input type="number" min={0} step={500}
                            value={Number.isFinite(otherCosts) ? otherCosts : ''} onChange={onNum(setOtherCosts)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="disclaimer">
                    This is a planning estimate, not a settlement statement or guarantee of proceeds. Actual payoff
                    amounts, title/escrow charges, taxes, HOA fees, negotiated real estate compensation, seller
                    contributions, repairs and other transaction costs may differ. Your real estate professional and
                    closing company can prepare a transaction-specific net sheet before you make a decision.
                  </div>
                </div>
              </section>

              {/* Summary */}
              <aside className="summary">
                <div className="summary-inner">
                  <div className="eyebrow">Estimated proceeds</div>
                  <h2>What you may have available after the sale</h2>
                  <div className="sub">A simple planning estimate based on the numbers you&rsquo;ve entered.</div>

                  <div className="net">
                    <div className="net-label">Estimated proceeds</div>
                    <div className="net-value">{money(Math.max(0, net))}</div>
                    <div className="net-note">Potentially available for your next move, savings, or other goals.</div>
                  </div>

                  <div className="breakdown">
                    <div className="line"><span>Estimated sale price</span><strong>{money(salePrice)}</strong></div>
                    <div className="line"><span>Mortgage &amp; property payoffs</span><strong>&minus;{money(payoffs)}</strong></div>
                    <div className="line"><span>Estimated selling expenses</span><strong>&minus;{money(expenses)}</strong></div>
                    <div className="line total"><span>Estimated proceeds</span><strong>{money(Math.max(0, net))}</strong></div>
                  </div>

                  <button type="button" className="summary-cta" onClick={scrollNext}>
                    See What This Could Do for My Next Home &rarr;
                  </button>
                </div>
              </aside>
            </div>

            <section className="next-card" id="nextHome">
              <div>
                <div className="mini">Next step</div>
                <h3>Turn your estimated proceeds into a next-home plan.</h3>
                <p>
                  We can use this amount as a starting point for your down payment, reserves, target payment, and
                  price range &mdash; without assuming you need to use all of it. {agentName} and {lenderName} map
                  the real-estate and financing sides together.
                </p>
              </div>
              <button type="button" className="next-btn">Explore My Next-Home Options &rarr;</button>
            </section>

            <div className="cobrand-strip">
              <div className="cb-side">
                <img className="cb-logo" src="/images/keller-williams-professional-partners.png"
                  alt="Keller Williams Professional Partners" />
                <div className="cb-txt">
                  <strong>{agentName}</strong>
                  <span>{agentTitle} &middot; {agentBrokerage}</span>
                </div>
              </div>
              <div className="cb-divider" />
              <div className="cb-side">
                <div className="cb-badge">CHM</div>
                <div className="cb-txt">
                  <strong>{lenderName}</strong>
                  <span>{lenderTitle} &middot; {lenderCompany} &middot; NMLS #{lenderNmls}</span>
                </div>
              </div>
            </div>
            <p className="cobrand-disclosure">{coBrandDisclosure}</p>
          </div>
        </main>
      </div>

      <style jsx>{`
        .sp-root{
          --navy:#10263f;--navy2:#17395d;--cream:#f7f3eb;--cream2:#efe7da;--white:#fff;
          --ink:#172433;--muted:#667483;--line:#ded8cc;--gold:#caa66b;--terra:#c96645;
          --green:#187f58;--shadow:0 18px 55px rgba(16,38,63,.10);
          min-height:100vh;background:#f5f3ef;color:var(--ink);
          font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
          line-height:1.5;
        }
        .sp-root *{box-sizing:border-box}
        .sp-root button,.sp-root input,.sp-root select{font:inherit}
        .sp-root button{cursor:pointer}
        .shell{min-height:100vh;display:grid;grid-template-columns:250px 1fr}
        .sidebar{background:var(--navy);color:#fff;padding:28px 20px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
        .logo{display:flex;align-items:center;gap:11px;padding:0 8px 26px;border-bottom:1px solid rgba(255,255,255,.1)}
        .logo-mark{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,#d1ac71,#b98d51);font-weight:900;color:#10263f}
        .logo strong{display:block;font-size:14px}
        .logo span{font-size:10px;color:#aebdca}
        .nav{margin-top:24px;display:grid;gap:7px}
        .nav a{text-decoration:none;color:#b8c5d1;padding:11px 12px;border-radius:10px;font-size:12px;font-weight:650}
        .nav a.active{background:rgba(255,255,255,.1);color:#fff}
        .nav a:hover{background:rgba(255,255,255,.07);color:#fff}
        .side-bottom{margin-top:auto;padding:16px 10px;border-top:1px solid rgba(255,255,255,.1);color:#96a8b8;font-size:10px}
        .main{min-width:0}
        .topbar{height:70px;background:#fff;border-bottom:1px solid #e6e2da;display:flex;align-items:center;justify-content:space-between;padding:0 36px}
        .topbar .crumb{font-size:11px;color:#778593}
        .topbar .team{display:flex;align-items:center;gap:8px;font-size:11px;color:#627080;font-weight:650}
        .avatars{display:flex}
        .avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;border:2px solid #fff;background:#dfe5ea;color:#526170;font-size:9px;font-weight:900;margin-left:-6px}
        .content{width:min(1080px,calc(100% - 50px));margin:0 auto;padding:48px 0 70px}
        .eyebrow{color:#a76b43;text-transform:uppercase;letter-spacing:.16em;font-size:10px;font-weight:900}
        h1{font-family:Georgia,"Times New Roman",serif;color:var(--navy);font-weight:600;font-size:46px;line-height:1.05;margin-top:8px;letter-spacing:-.02em}
        .intro{color:var(--muted);font-size:15px;max-width:680px;margin-top:13px}
        .grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);gap:22px;margin-top:34px;align-items:start}
        .card{background:#fff;border:1px solid #e3ded5;border-radius:22px;box-shadow:var(--shadow);overflow:hidden}
        .card-inner{padding:28px}
        .card-title{font-size:17px;color:var(--navy);font-weight:800}
        .card-sub{font-size:12px;color:var(--muted);margin-top:4px}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}
        .field label{display:block;color:var(--navy);font-size:11px;font-weight:800;margin:0 0 6px}
        .field .help{font-size:9px;color:#8b969f;margin-top:5px}
        .input-wrap{position:relative}
        .prefix{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#70808f;font-size:13px;font-weight:700;pointer-events:none}
        input,select{width:100%;height:48px;border:1px solid #cfd6dc;border-radius:10px;background:#fbfcfd;color:var(--ink);padding:0 13px;font-size:14px}
        .input-wrap input{padding-left:27px}
        input:focus,select:focus{outline:none;border-color:#b88b53;box-shadow:0 0 0 4px rgba(202,166,107,.14);background:#fff}
        .state-row{grid-column:1/-1}
        .summary{background:linear-gradient(160deg,#17395d,#10263f);color:#fff;border-radius:22px;overflow:hidden;box-shadow:0 22px 60px rgba(16,38,63,.18)}
        .summary-inner{padding:28px}
        .summary .eyebrow{color:#e7ca95}
        .summary h2{font-family:Georgia,"Times New Roman",serif;font-size:31px;line-height:1.08;font-weight:600;margin-top:8px}
        .summary .sub{color:#c7d3de;font-size:12px;margin-top:8px}
        .net{margin-top:25px;padding:22px;border-radius:17px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12)}
        .net-label{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#d7c49f;font-weight:900}
        .net-value{font-size:43px;font-weight:850;letter-spacing:-.03em;margin-top:2px}
        .net-note{font-size:11px;color:#c4d0dc;margin-top:4px}
        .breakdown{display:grid;gap:10px;margin-top:21px}
        .line{display:flex;justify-content:space-between;gap:16px;font-size:12px}
        .line span:first-child{color:#c7d3de}
        .line strong{font-weight:750}
        .line.total{padding-top:12px;border-top:1px solid rgba(255,255,255,.14)}
        .summary-cta{width:100%;border:0;border-radius:11px;padding:14px 16px;margin-top:22px;background:#d0aa6c;color:#132840;font-weight:900;font-size:13px}
        .summary-cta:hover{filter:brightness(1.04)}
        .assumptions{margin-top:22px}
        .assumptions-toggle{width:100%;background:none;border:0;padding:0;display:flex;justify-content:space-between;align-items:center;color:#536475;font-size:12px;font-weight:800;text-align:left}
        .assumptions-toggle span:last-child{font-size:18px;font-weight:400;transition:.2s transform}
        .assumptions-toggle.open span:last-child{transform:rotate(45deg)}
        .assumptions-panel{display:none;margin-top:14px;padding-top:18px;border-top:1px solid #ebe6dd}
        .assumptions-panel.show{display:block}
        .assumption-row{display:grid;grid-template-columns:1fr 118px;gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid #f0ece5}
        .assumption-row:last-child{border-bottom:0}
        .assumption-copy strong{display:block;color:var(--navy);font-size:12px}
        .assumption-copy span{display:block;color:#7c8995;font-size:9px;margin-top:2px;line-height:1.45}
        .small-input{position:relative}
        .small-input input{text-align:right;padding-right:28px}
        .suffix{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;color:#73818d}
        .dollar-small input{padding-left:24px;padding-right:10px;text-align:right}
        .dollar-small .prefix{left:10px}
        .disclaimer{margin-top:18px;padding:14px 15px;border-radius:11px;background:#f5f1e9;color:#78838d;font-size:9px;line-height:1.55}
        .next-card{margin-top:22px;background:#fff;border:1px solid #e2ddd5;border-radius:22px;padding:26px;display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center}
        .next-card .mini{font-size:9px;color:#a86d46;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .next-card h3{font-family:Georgia,"Times New Roman",serif;color:var(--navy);font-size:25px;font-weight:600;margin-top:5px}
        .next-card p{font-size:11px;color:#74818d;margin-top:6px}
        .next-btn{border:1px solid #bfc9d1;background:#fff;color:var(--navy);border-radius:10px;padding:12px 16px;font-size:11px;font-weight:850;white-space:nowrap}
        .next-btn:hover{background:#f8f9fa}
        .cobrand-disclosure{margin-top:22px;color:#8b949d;font-size:9px;line-height:1.6;max-width:900px}
        .cobrand-strip{margin-top:26px;padding:18px 20px;background:#fff;border:1px solid #e3ded5;border-radius:18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:22px;flex-wrap:wrap}
        .cb-side{display:flex;align-items:center;gap:13px;min-width:0}
        .cb-logo{height:34px;width:auto;display:block}
        .cb-badge{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(145deg,#17395d,#10263f);color:#e7ca95;font-weight:900;font-size:12px;letter-spacing:.04em}
        .cb-txt{line-height:1.25}
        .cb-txt strong{display:block;color:var(--navy);font-size:13px}
        .cb-txt span{display:block;color:#7c8995;font-size:10px;margin-top:2px}
        .cb-divider{width:1px;align-self:stretch;background:#e6e1d8}
        @media(max-width:600px){.cb-divider{display:none}.cobrand-strip{gap:14px}}
        @media(max-width:900px){
          .shell{grid-template-columns:1fr}
          .sidebar{display:none}
          .grid{grid-template-columns:1fr}
          .topbar{padding:0 22px}
          .content{width:min(100% - 28px,1080px);padding-top:32px}
        }
        @media(max-width:600px){
          h1{font-size:38px}
          .form-grid{grid-template-columns:1fr}
          .state-row{grid-column:auto}
          .card-inner,.summary-inner{padding:22px 18px}
          .net-value{font-size:37px}
          .next-card{grid-template-columns:1fr}
          .next-btn{width:100%}
          .topbar .team span{display:none}
        }
      `}</style>
    </div>
  );
}
