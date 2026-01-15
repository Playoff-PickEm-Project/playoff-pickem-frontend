import React, { useMemo } from 'react';
import { X, CheckCircle2, Circle, Lock } from 'lucide-react';

export function PropSelectionModal({
  isOpen,
  onClose,
  allProps,
  selectedPropIds,
  onSelectProp,
  onDeselectProp,
  propLimit,
  gameStatus,
}) {
  const isLocked = gameStatus !== 'upcoming';

  // Separate mandatory and optional props
  const { mandatoryProps, optionalProps } = useMemo(() => {
    const mandatory = {
      winner_loser: allProps.winner_loser?.filter(p => p.is_mandatory) || [],
      over_under: allProps.over_under?.filter(p => p.is_mandatory) || [],
      variable_option: allProps.variable_option?.filter(p => p.is_mandatory) || [],
    };
    const optional = {
      winner_loser: allProps.winner_loser?.filter(p => !p.is_mandatory) || [],
      over_under: allProps.over_under?.filter(p => !p.is_mandatory) || [],
      variable_option: allProps.variable_option?.filter(p => !p.is_mandatory) || [],
    };
    return { mandatoryProps: mandatory, optionalProps: optional };
  }, [allProps]);

  const mandatoryCount =
    mandatoryProps.winner_loser.length +
    mandatoryProps.over_under.length +
    mandatoryProps.variable_option.length;

  // Helper to check if a prop is mandatory (must be defined before use)
  const isPropMandatory = (propType, propId) => {
    if (propType === 'winner_loser') {
      return mandatoryProps.winner_loser.some(p => (p.prop_id || p.id) === propId);
    } else if (propType === 'over_under') {
      return mandatoryProps.over_under.some(p => (p.prop_id || p.id) === propId);
    } else if (propType === 'variable_option') {
      return mandatoryProps.variable_option.some(p => (p.prop_id || p.id) === propId);
    }
    return false;
  };

  // Count only optional selections
  const optionalSelectionCount = selectedPropIds.filter(sel => {
    const propType = sel.prop_type;
    const propId = sel.prop_id;
    return !isPropMandatory(propType, propId);
  }).length;

  const canSelectMore = optionalSelectionCount < propLimit;

  const isPropSelected = (propType, propId) => {
    return selectedPropIds.some(
      (sel) => sel.prop_type === propType && sel.prop_id === propId
    );
  };

  const handlePropClick = (propType, propId, isMandatory) => {
    if (isLocked) return;
    if (isMandatory) return; // Cannot select/deselect mandatory props

    const isSelected = isPropSelected(propType, propId);

    if (isSelected) {
      onDeselectProp(propType, propId);
    } else if (canSelectMore) {
      onSelectProp(propType, propId);
    }
  };

  // Early return after all hooks
  if (!isOpen) return null;

  const renderPropCard = (prop, propType, isMandatory = false) => {
    const propId = prop.prop_id || prop.id;
    const isSelected = isPropSelected(propType, propId) || isMandatory;
    const canSelect = canSelectMore || isSelected;

    return (
      <div
        key={`${propType}-${propId}`}
        onClick={() => handlePropClick(propType, propId, isMandatory)}
        className={`p-4 rounded-2xl border-2 transition-all ${
          isMandatory
            ? 'bg-blue-500/10 border-blue-500/50 cursor-default'
            : isLocked
            ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30 cursor-pointer'
            : canSelect
            ? 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10 cursor-pointer'
            : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium mb-1 break-words">
              {prop.question}
            </p>
            <div className="text-xs text-gray-400">
              {propType === 'winner_loser' && (
                <span>
                  {prop.team_a_name} vs {prop.team_b_name}
                </span>
              )}
              {propType === 'over_under' && (
                <span>
                  {prop.player_name} • {prop.stat_type?.replace(/_/g, ' ')} • Line: {prop.line_value}
                </span>
              )}
              {propType === 'variable_option' && (
                <span>{prop.options?.length || 0} options</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isMandatory ? (
              <Lock className="w-6 h-6 text-blue-400" />
            ) : isSelected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-500" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-3xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Select Your Props</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {mandatoryCount > 0 && (
              <p className="text-blue-400 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {mandatoryCount} required prop{mandatoryCount !== 1 ? 's' : ''}
              </p>
            )}
            <p className="text-gray-400 text-sm">
              Choose {propLimit} optional prop{propLimit !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Optional selected:</span>
              <span
                className={`text-lg font-bold ${
                  optionalSelectionCount === propLimit
                    ? 'text-emerald-500'
                    : 'text-white'
                }`}
              >
                {optionalSelectionCount} / {propLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Props List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mandatory Props Section */}
          {mandatoryCount > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">
                  Required Props (Must Answer)
                </h3>
              </div>
              <div className="space-y-3">
                {mandatoryProps.winner_loser.map((prop) =>
                  renderPropCard(prop, 'winner_loser', true)
                )}
                {mandatoryProps.over_under.map((prop) =>
                  renderPropCard(prop, 'over_under', true)
                )}
                {mandatoryProps.variable_option.map((prop) =>
                  renderPropCard(prop, 'variable_option', true)
                )}
              </div>
            </div>
          )}

          {/* Optional Props Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Optional Props (Choose {propLimit})
            </h3>

            {/* Winner/Loser Props */}
            {optionalProps.winner_loser.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Winner/Loser
                </h4>
                <div className="space-y-3">
                  {optionalProps.winner_loser.map((prop) =>
                    renderPropCard(prop, 'winner_loser', false)
                  )}
                </div>
              </div>
            )}

            {/* Over/Under Props */}
            {optionalProps.over_under.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Over/Under
                </h4>
                <div className="space-y-3">
                  {optionalProps.over_under.map((prop) =>
                    renderPropCard(prop, 'over_under', false)
                  )}
                </div>
              </div>
            )}

            {/* Variable Option Props */}
            {optionalProps.variable_option.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Other Props
                </h4>
                <div className="space-y-3">
                  {optionalProps.variable_option.map((prop) =>
                    renderPropCard(prop, 'variable_option', false)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {isLocked ? (
                'Prop selection is locked'
              ) : optionalSelectionCount < propLimit ? (
                `Select ${propLimit - optionalSelectionCount} more optional prop${
                  propLimit - optionalSelectionCount === 1 ? '' : 's'
                }`
              ) : (
                `Ready! Answer ${mandatoryCount} required + ${propLimit} optional props`
              )}
            </p>
            <button
              onClick={onClose}
              disabled={optionalSelectionCount !== propLimit && !isLocked}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                optionalSelectionCount === propLimit || isLocked
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLocked ? 'Close' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
