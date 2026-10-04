"""
Deterministic ROI Calculator.

Pure Python mathematical model for sales business cases.
Zero LLM inference — all outputs are exact, deterministic, and auditable.
"""
from __future__ import annotations

from app.exceptions import ROICalculationError, ROIInputError
from app.schemas import ROIInputs, ROIResult

FORMULAS = {
    "annual_savings": "current_cost * expected_savings_pct + additional_revenue",
    "net_benefit": "(annual_savings - ongoing_cost) * time_period_years - implementation_cost",
    "roi_percentage": "(net_benefit / total_investment) * 100",
    "payback_period_years": "implementation_cost / (annual_savings - ongoing_cost)",
}


class ROICalculator:
    """Deterministic financial calculator for sales proposals."""

    @staticmethod
    def calculate(inputs: ROIInputs) -> ROIResult:
        """
        Calculate ROI metrics with complete auditability.

        Args:
            inputs: Validated ROIInputs

        Returns:
            Validated ROIResult

        Raises:
            ROIInputError: If input values are mathematically invalid
            ROICalculationError: If calculation fails
        """
        if inputs.current_cost <= 0:
            raise ROIInputError("current_cost must be greater than zero", ["current_cost"])
        if inputs.time_period_years <= 0:
            raise ROIInputError("time_period_years must be at least 1", ["time_period_years"])

        # 1. Annual gross savings & net operational benefit per year
        annual_direct_savings = inputs.current_cost * inputs.expected_savings_pct
        annual_savings = annual_direct_savings + inputs.additional_revenue
        annual_net_cashflow = annual_savings - inputs.ongoing_cost

        # 2. Cumulative benefits over analysis period
        total_ongoing_costs = inputs.ongoing_cost * inputs.time_period_years
        total_investment = inputs.implementation_cost + total_ongoing_costs
        cumulative_savings = annual_savings * inputs.time_period_years
        net_benefit = cumulative_savings - total_investment

        # 3. ROI Percentage: Net Benefit / Total Investment
        warnings: list[str] = []
        if total_investment > 0:
            roi_percentage = (net_benefit / total_investment) * 100.0
        else:
            roi_percentage = 0.0
            warnings.append("Total investment is zero; ROI calculation defaulted to 0.0%")

        # 4. Payback period in years
        payback_period_years: float | None = None
        if inputs.implementation_cost == 0:
            payback_period_years = 0.0
        elif annual_net_cashflow > 0:
            payback_period_years = round(inputs.implementation_cost / annual_net_cashflow, 2)
        else:
            payback_period_years = None
            warnings.append(
                "Negative or zero annual net cashflow; investment does not pay back."
            )

        # 5. Milestone projections (3-year and 5-year)
        three_year_investment = inputs.implementation_cost + (inputs.ongoing_cost * 3)
        three_year_benefit = (annual_savings * 3) - three_year_investment

        five_year_benefit: float | None = None
        if inputs.time_period_years >= 5:
            five_year_investment = inputs.implementation_cost + (inputs.ongoing_cost * 5)
            five_year_benefit = (annual_savings * 5) - five_year_investment

        assumptions = [
            f"Annual current reporting/labor cost baseline: ${inputs.current_cost:,.2f}",
            f"Expected labor savings rate: {inputs.expected_savings_pct * 100:.1f}%",
            f"One-time onboarding & implementation fee: ${inputs.implementation_cost:,.2f}",
            f"Annual ongoing platform license cost: ${inputs.ongoing_cost:,.2f}",
            f"Analysis horizon: {inputs.time_period_years} years",
        ]

        if inputs.additional_revenue > 0:
            assumptions.append(f"Projected additional annual revenue: ${inputs.additional_revenue:,.2f}")

        return ROIResult(
            inputs=inputs,
            annual_savings=round(annual_savings, 2),
            net_benefit=round(net_benefit, 2),
            roi_percentage=round(roi_percentage, 2),
            payback_period_years=payback_period_years,
            three_year_benefit=round(three_year_benefit, 2),
            five_year_benefit=round(five_year_benefit, 2) if five_year_benefit is not None else None,
            assumptions=assumptions,
            warnings=warnings,
            formulas=FORMULAS,
        )
