"""
Unit tests for Pricing Tool, Service, and Repository.
Ensures zero-hallucinated pricing and proper error handling when unavailable.
"""
import pytest

from app.schemas import PricingResult
from app.services.pricing_service import PricingService
from app.tools.pricing.tool import PricingTool


@pytest.mark.asyncio
async def test_get_price_valid_product():
    tool = PricingTool()
    res = await tool.get_price(product_id="PROD-REP-01", quantity=10)
    assert res.success is True
    pricing: PricingResult = res.data
    assert pricing.product_id == "PROD-REP-01"
    assert pricing.unit_price == 1200.0
    # 10 seats at $1200 = $12,000 (no auto discount under 20)
    assert pricing.total_price == 12000.0


@pytest.mark.asyncio
async def test_get_price_volume_discount():
    tool = PricingTool()
    # 25 seats gets automatic 10% discount
    res = await tool.get_price(product_id="PROD-REP-01", quantity=25)
    assert res.success is True
    pricing: PricingResult = res.data
    # 25 * 1200 = 30,000. 10% off = 27,000
    assert pricing.discount_pct == 0.10
    assert pricing.total_price == 27000.0


@pytest.mark.asyncio
async def test_pricing_unavailable_for_unknown_sku():
    tool = PricingTool()
    res = await tool.get_price(product_id="PROD-UNKNOWN-999")
    assert res.success is False
    assert "Pricing unavailable" in (res.error or "")
