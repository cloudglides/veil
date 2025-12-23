import { useState } from 'react'
import { getFingerprint, compareFingerpints } from '@cloudglides/veil'
import './App.css'

export default function App() {
  const [fingerprint, setFingerprint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detailed, setDetailed] = useState(true)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getFingerprint({
        hash: 'sha256',
        detailed,
      })
      setFingerprint(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    const text = typeof fingerprint === 'string' 
      ? fingerprint 
      : JSON.stringify(fingerprint, null, 2)
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="container">
      <h1>Veil Fingerprinting</h1>
      
      <div className="card">
        <label className="checkbox">
          <input 
            type="checkbox" 
            checked={detailed}
            onChange={(e) => setDetailed(e.target.checked)}
          />
          Detailed output (JSON)
        </label>

        <div className="controls">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Generating...' : 'Generate Fingerprint'}
          </button>
          
          {fingerprint && (
            <button onClick={handleCopy} className="btn btn-secondary">
              Copy Result
            </button>
          )}
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {fingerprint && (
          <div className="result">
            {typeof fingerprint === 'string' ? (
              <>
                <h3>Hash</h3>
                <pre>{fingerprint}</pre>
              </>
            ) : (
              <>
                <h3>Hash</h3>
                <pre>{fingerprint.hash}</pre>

                <h3>Metrics</h3>
                <table className="metrics">
                  <tbody>
                    <tr>
                      <td>Uniqueness</td>
                      <td>{(fingerprint.uniqueness * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Confidence</td>
                      <td>{(fingerprint.confidence * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Tampering Risk</td>
                      <td>{(fingerprint.tampering_risk * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Stability Score</td>
                      <td>{(fingerprint.stability_score * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Usable</td>
                      <td>{fingerprint.usable ? '✓' : '✗'}</td>
                    </tr>
                  </tbody>
                </table>

                {fingerprint.anomalies && fingerprint.anomalies.length > 0 && (
                  <>
                    <h3>Anomalies ({fingerprint.anomalies.length})</h3>
                    <div className="anomalies">
                      {fingerprint.anomalies.map((anom) => (
                        <div key={anom.id} className={`anomaly severity-${anom.severity}`}>
                          <strong>[{anom.severity.toUpperCase()}]</strong> {anom.id}
                          <div className="category">{anom.category}</div>
                          <div className="message">{anom.message}</div>
                          <div className="risk">Risk: {(anom.riskContribution * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h3>System</h3>
                <table className="metrics">
                  <tbody>
                    <tr>
                      <td>OS</td>
                      <td>{fingerprint.system.os}</td>
                    </tr>
                    <tr>
                      <td>Language</td>
                      <td>{fingerprint.system.language}</td>
                    </tr>
                    <tr>
                      <td>Timezone</td>
                      <td>{fingerprint.system.timezone}</td>
                    </tr>
                    <tr>
                      <td>CPU Cores</td>
                      <td>{fingerprint.system.hardware.cores}</td>
                    </tr>
                    <tr>
                      <td>Memory</td>
                      <td>{fingerprint.system.hardware.memory} GB</td>
                    </tr>
                  </tbody>
                </table>

                <h3>Display</h3>
                <table className="metrics">
                  <tbody>
                    <tr>
                      <td>Resolution</td>
                      <td>{fingerprint.display.resolution}</td>
                    </tr>
                    <tr>
                      <td>Color Depth</td>
                      <td>{fingerprint.display.colorDepth}</td>
                    </tr>
                    <tr>
                      <td>Pixel Ratio</td>
                      <td>{fingerprint.display.devicePixelRatio}</td>
                    </tr>
                  </tbody>
                </table>

                <h3>Browser</h3>
                <table className="metrics">
                  <tbody>
                    <tr>
                      <td>Vendor</td>
                      <td>{fingerprint.browser.vendor}</td>
                    </tr>
                    <tr>
                      <td>Cookies</td>
                      <td>{fingerprint.browser.cookieEnabled ? 'Enabled' : 'Disabled'}</td>
                    </tr>
                  </tbody>
                </table>

                <h3>Entropy Sources ({fingerprint.sources.length})</h3>
                <table className="sources">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Entropy</th>
                      <th>Confidence</th>
                      <th>Stability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fingerprint.sources.map((source) => (
                      <tr key={source.source}>
                        <td>{source.source}</td>
                        <td>{source.entropy.toFixed(3)}</td>
                        <td>{(source.confidence * 100).toFixed(1)}%</td>
                        <td>{source.stability ? (source.stability * 100).toFixed(1) + '%' : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
