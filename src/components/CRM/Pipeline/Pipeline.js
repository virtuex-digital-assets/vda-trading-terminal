import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient } from '../../../store/actions';
import './Pipeline.css';

const STAGES = [
  { key: 'New Lead',      color: '#5566aa', border: '#5566aa' },
  { key: 'Contacted',     color: '#4fc3f7', border: '#4fc3f7' },
  { key: 'KYC Submitted', color: '#ffa726', border: '#ffa726' },
  { key: 'KYC Verified',  color: '#ce93d8', border: '#ab47bc' },
  { key: 'Funded',        color: '#29b6f6', border: '#29b6f6' },
  { key: 'Active',        color: '#66bb6a', border: '#66bb6a' },
  { key: 'Inactive',      color: '#ef5350', border: '#ef5350' },
];

const Pipeline = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector((s) => s.crm);

  const byStage = Object.fromEntries(
    STAGES.map(({ key }) => [key, clients.filter((c) => c.stage === key)])
  );

  return (
    <div className="pipeline">
      <div className="pipeline-header">
        Sales Pipeline · {clients.length} total client{clients.length !== 1 ? 's' : ''}
      </div>

      <div className="pipeline-board">
        {STAGES.map(({ key, color, border }) => {
          const colClients = byStage[key];
          return (
            <div key={key} className="pipeline-col">
              <div
                className="pipeline-col-header"
                style={{ color, borderBottomColor: border }}
              >
                <span>{key}</span>
                <span className="pipeline-col-count" style={{ color }}>{colClients.length}</span>
              </div>
              <div className="pipeline-cards">
                {colClients.length === 0 ? (
                  <div className="pipeline-empty">No clients</div>
                ) : (
                  colClients.map((c) => (
                    <div
                      key={c.id}
                      className="pipeline-card"
                      onClick={() => dispatch(crmSelectClient(c.id))}
                    >
                      <div className="pc-name">{c.firstName} {c.lastName}</div>
                      <div className="pc-country">{c.country}</div>
                      <div className="pc-footer">
                        <span className="pc-balance">
                          {c.balance > 0
                            ? `$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                            : 'No funds'}
                        </span>
                        <span className={`pc-kyc pc-kyc-${c.kycStatus}`}>{c.kycStatus}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span className="pc-assigned">{c.assignedTo}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
