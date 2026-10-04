"""
Unit tests for deterministic ROI calculations and ROI Tool.
"""
import pytest

from app.exceptions import ROIInputError
from app.schemas import ROIInputs
from app.tools.roi.calculator import ROICalculator
from app.tools.roi.tool import ROITool


def test_roi_calculator_exact_values():
    # Baseline: $200,000 current cost, 30% savings ($60,000/yr), 3-year period
    # Implementation: $15,000 one-time, $24,000/yr ongoing
    inputs = ROIInputs(
        current_cost=200000.0,
        expected_savings_pct=0.30,
        implementation_cost=15000.0,
        time_period_years=3,
        ongoing_cost=24000.0,
    )
    res = ROICalculator.calculate(inputs)

    assert res.annual_savings == 60000.0
    # Total investment over 3 years: 15,000 + (24,000 * 3) = 87,000
    # Total gross savings: 60,000 * 3 = 180,000
    # Net benefit: 180,000 - 87,000 = 93,000
    assert res.net_benefit == 93000.0
    # ROI %: (93,000 / 87,000) * 100 = 106.9%
    assert res.roi_percentage == pytest.approx(106.9, rel=1e-2)
    # Payback period: 15,000 / (60,000 - 24,000) = 15,000 / 36,000 = 0.42 years (approx 5 months)
    assert res.payback_period_years == 0.42
    assert "annual_savings" in res.formulas


def test_roi_inputs_validation():
    with pytest.raises(Exception):
        # savings pct cannot be > 1.0
        ROIInputs(current_cost=100000, expected_savings_pct=1.5, time_period_years=3)

    with pytest.raises(Exception):
        # current_cost must be > 0
        ROIInputs(current_cost=-5000, expected_savings_pct=0.2, time_period_years=3)


@pytest.mark.asyncio
async def test_roi_tool_async():
    tool = ROITool()
    res = await tool.calculate_roi(
        current_cost=150000.0,
        expected_savings_pct=0.25,
        implementation_cost=10000.0,
        time_period_years=3,
        ongoing_cost=12000.0,
    )
    assert res.success is True
    assert res.data.annual_savings == 37500.0
    assert res.data.payback_period_years is not None
