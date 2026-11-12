/* ============================================================
   RELYC CONTRACTOR — Contact page configuration
   Inquiry paths and the trade / capability directory from the
   Contact & Partner Registration package (2026-10-29).
   Status: proposed, pending Relyc's final approval.
   Labels can change; the ids must stay stable.
   ============================================================ */
window.RELYC_FORM_CONFIG = {
  "schemaVersion": "1.0",
  "status": "PROPOSED - final business approval required",
  "routes": {
    "project": {
      "label": "Project Inquiry",
      "steps": [
        {
          "key": "contact",
          "title": "Your contact",
          "desc": "Tell us how to reach you."
        },
        {
          "key": "details",
          "title": "Project details",
          "desc": "Share the scope, location and target timeline."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your project inquiry before sending."
        }
      ]
    },
    "bid": {
      "label": "Bid Invitation",
      "steps": [
        {
          "key": "contact",
          "title": "Your contact",
          "desc": "Tell us who is inviting Relyc to bid."
        },
        {
          "key": "details",
          "title": "Bid information",
          "desc": "Share the project, location and submission deadline."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your bid invitation before sending."
        }
      ]
    },
    "trade": {
      "label": "Trade Partner Registration",
      "steps": [
        {
          "key": "contact",
          "title": "Company & contact",
          "desc": "Start with your company and the person we should contact."
        },
        {
          "key": "trades",
          "title": "Trades & capabilities",
          "desc": "Select all trades and the specific work your team performs."
        },
        {
          "key": "qualifications",
          "title": "Qualifications",
          "desc": "Tell us about licensing for the scopes you selected."
        },
        {
          "key": "review",
          "title": "Review & submit",
          "desc": "Check your company profile before sending it for review."
        }
      ]
    },
    "design": {
      "label": "Architect / Engineer Inquiry",
      "steps": [
        {
          "key": "contact",
          "title": "Firm & contact",
          "desc": "Tell us about your firm and primary contact."
        },
        {
          "key": "details",
          "title": "Disciplines & experience",
          "desc": "Select your disciplines and describe your relevant experience."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your inquiry before sending."
        }
      ]
    },
    "supplier": {
      "label": "Material Supplier / Vendor Inquiry",
      "steps": [
        {
          "key": "contact",
          "title": "Company & contact",
          "desc": "Tell us about your company and primary contact."
        },
        {
          "key": "details",
          "title": "Products & service area",
          "desc": "Tell us what you supply and where you deliver."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your supplier inquiry before sending."
        }
      ]
    },
    "equipment": {
      "label": "Equipment Provider Inquiry",
      "steps": [
        {
          "key": "contact",
          "title": "Company & contact",
          "desc": "Tell us about your company and primary contact."
        },
        {
          "key": "details",
          "title": "Equipment & services",
          "desc": "Describe available equipment, services and delivery coverage."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your equipment inquiry before sending."
        }
      ]
    },
    "documents": {
      "label": "Company Document Request",
      "steps": [
        {
          "key": "contact",
          "title": "Contact & request",
          "desc": "Tell us who should receive the information and what you need."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your document request before sending."
        }
      ]
    },
    "general": {
      "label": "General Inquiry",
      "steps": [
        {
          "key": "contact",
          "title": "Contact & message",
          "desc": "Tell us how to reach you and how we can help."
        },
        {
          "key": "review",
          "title": "Review & send",
          "desc": "Check your message before sending."
        }
      ]
    }
  },
  "tradeCatalog": [
    {
      "id": "grp_sitework_and_civil",
      "label": "Sitework & Civil",
      "trades": [
        {
          "id": "trade_sitework",
          "label": "Sitework",
          "capabilities": [
            {
              "id": "cap_sitework__earthwork",
              "label": "Earthwork"
            },
            {
              "id": "cap_sitework__grading",
              "label": "Grading"
            },
            {
              "id": "cap_sitework__drainage",
              "label": "Drainage"
            }
          ]
        },
        {
          "id": "trade_underground_utilities",
          "label": "Underground Utilities",
          "capabilities": [
            {
              "id": "cap_underground_utilities__water",
              "label": "Water"
            },
            {
              "id": "cap_underground_utilities__sanitary",
              "label": "Sanitary"
            },
            {
              "id": "cap_underground_utilities__storm_drainage",
              "label": "Storm Drainage"
            }
          ]
        },
        {
          "id": "trade_paving",
          "label": "Paving",
          "capabilities": [
            {
              "id": "cap_paving__asphalt",
              "label": "Asphalt"
            },
            {
              "id": "cap_paving__concrete_paving",
              "label": "Concrete Paving"
            },
            {
              "id": "cap_paving__repairs_and_striping",
              "label": "Repairs & Striping"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_structure",
      "label": "Structure",
      "trades": [
        {
          "id": "trade_concrete",
          "label": "Concrete",
          "capabilities": [
            {
              "id": "cap_concrete__foundations",
              "label": "Foundations"
            },
            {
              "id": "cap_concrete__slabs",
              "label": "Slabs"
            },
            {
              "id": "cap_concrete__structural_concrete",
              "label": "Structural Concrete"
            },
            {
              "id": "cap_concrete__site_concrete",
              "label": "Site Concrete"
            }
          ]
        },
        {
          "id": "trade_structural_steel",
          "label": "Structural Steel",
          "capabilities": [
            {
              "id": "cap_structural_steel__fabrication",
              "label": "Fabrication"
            },
            {
              "id": "cap_structural_steel__erection",
              "label": "Erection"
            },
            {
              "id": "cap_structural_steel__miscellaneous_metals",
              "label": "Miscellaneous Metals"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_envelope_and_openings",
      "label": "Envelope & Openings",
      "trades": [
        {
          "id": "trade_roofing",
          "label": "Roofing",
          "capabilities": [
            {
              "id": "cap_roofing__low_slope_roofing",
              "label": "Low-Slope Roofing"
            },
            {
              "id": "cap_roofing__steep_slope_roofing",
              "label": "Steep-Slope Roofing"
            },
            {
              "id": "cap_roofing__roof_repairs",
              "label": "Roof Repairs"
            },
            {
              "id": "cap_roofing__roof_replacement",
              "label": "Roof Replacement"
            }
          ]
        },
        {
          "id": "trade_waterproofing",
          "label": "Waterproofing",
          "capabilities": [
            {
              "id": "cap_waterproofing__walls_and_joints",
              "label": "Walls & Joints"
            },
            {
              "id": "cap_waterproofing__decks",
              "label": "Decks"
            },
            {
              "id": "cap_waterproofing__below_grade",
              "label": "Below-Grade"
            }
          ]
        },
        {
          "id": "trade_glazing",
          "label": "Glazing",
          "capabilities": [
            {
              "id": "cap_glazing__storefront",
              "label": "Storefront"
            },
            {
              "id": "cap_glazing__windows",
              "label": "Windows"
            },
            {
              "id": "cap_glazing__glass_replacement",
              "label": "Glass Replacement"
            }
          ]
        },
        {
          "id": "trade_doors_and_hardware",
          "label": "Doors & Hardware",
          "capabilities": [
            {
              "id": "cap_doors_and_hardware__interior_doors",
              "label": "Interior Doors"
            },
            {
              "id": "cap_doors_and_hardware__exterior_doors",
              "label": "Exterior Doors"
            },
            {
              "id": "cap_doors_and_hardware__frames_and_hardware",
              "label": "Frames & Hardware"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_mechanical_electrical_and_plumbing",
      "label": "Mechanical, Electrical & Plumbing",
      "trades": [
        {
          "id": "trade_hvac_and_mechanical",
          "label": "HVAC & Mechanical",
          "capabilities": [
            {
              "id": "cap_hvac_and_mechanical__equipment_installation",
              "label": "Equipment Installation"
            },
            {
              "id": "cap_hvac_and_mechanical__ductwork",
              "label": "Ductwork"
            },
            {
              "id": "cap_hvac_and_mechanical__controls",
              "label": "Controls"
            },
            {
              "id": "cap_hvac_and_mechanical__service_and_maintenance",
              "label": "Service & Maintenance"
            }
          ]
        },
        {
          "id": "trade_plumbing",
          "label": "Plumbing",
          "capabilities": [
            {
              "id": "cap_plumbing__water_and_sanitary_piping",
              "label": "Water & Sanitary Piping"
            },
            {
              "id": "cap_plumbing__fixtures_and_equipment",
              "label": "Fixtures & Equipment"
            },
            {
              "id": "cap_plumbing__water_heaters",
              "label": "Water Heaters"
            },
            {
              "id": "cap_plumbing__repairs_and_maintenance",
              "label": "Repairs & Maintenance"
            }
          ]
        },
        {
          "id": "trade_electrical",
          "label": "Electrical",
          "capabilities": [
            {
              "id": "cap_electrical__lighting_and_controls",
              "label": "Lighting & Controls"
            },
            {
              "id": "cap_electrical__power_distribution",
              "label": "Power Distribution"
            },
            {
              "id": "cap_electrical__generators",
              "label": "Generators"
            },
            {
              "id": "cap_electrical__service_upgrades",
              "label": "Service Upgrades"
            }
          ]
        },
        {
          "id": "trade_low_voltage",
          "label": "Low-Voltage",
          "capabilities": [
            {
              "id": "cap_low_voltage__data_and_communications",
              "label": "Data & Communications"
            },
            {
              "id": "cap_low_voltage__security_and_access_control",
              "label": "Security & Access Control"
            },
            {
              "id": "cap_low_voltage__cameras",
              "label": "Cameras"
            },
            {
              "id": "cap_low_voltage__audio_visual",
              "label": "Audio / Visual"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_fire_protection_and_life_safety",
      "label": "Fire Protection & Life Safety",
      "trades": [
        {
          "id": "trade_fire_sprinklers",
          "label": "Fire Sprinklers",
          "capabilities": [
            {
              "id": "cap_fire_sprinklers__installation",
              "label": "Installation"
            },
            {
              "id": "cap_fire_sprinklers__modifications",
              "label": "Modifications"
            },
            {
              "id": "cap_fire_sprinklers__inspection_testing",
              "label": "Inspection / Testing"
            }
          ]
        },
        {
          "id": "trade_fire_alarm",
          "label": "Fire Alarm",
          "capabilities": [
            {
              "id": "cap_fire_alarm__installation",
              "label": "Installation"
            },
            {
              "id": "cap_fire_alarm__modifications",
              "label": "Modifications"
            },
            {
              "id": "cap_fire_alarm__inspection_testing",
              "label": "Inspection / Testing"
            }
          ]
        },
        {
          "id": "trade_other_life_safety",
          "label": "Other Life Safety",
          "capabilities": [
            {
              "id": "cap_other_life_safety__describe_your_specialty",
              "label": "Describe Your Specialty"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_interiors_and_finishes",
      "label": "Interiors & Finishes",
      "trades": [
        {
          "id": "trade_drywall",
          "label": "Drywall",
          "capabilities": [
            {
              "id": "cap_drywall__framing",
              "label": "Framing"
            },
            {
              "id": "cap_drywall__board_installation",
              "label": "Board Installation"
            },
            {
              "id": "cap_drywall__finishing",
              "label": "Finishing"
            }
          ]
        },
        {
          "id": "trade_painting",
          "label": "Painting",
          "capabilities": [
            {
              "id": "cap_painting__interior",
              "label": "Interior"
            },
            {
              "id": "cap_painting__exterior",
              "label": "Exterior"
            },
            {
              "id": "cap_painting__specialty_coatings",
              "label": "Specialty Coatings"
            }
          ]
        },
        {
          "id": "trade_flooring",
          "label": "Flooring",
          "capabilities": [
            {
              "id": "cap_flooring__tile",
              "label": "Tile"
            },
            {
              "id": "cap_flooring__resilient_flooring",
              "label": "Resilient Flooring"
            },
            {
              "id": "cap_flooring__carpet",
              "label": "Carpet"
            },
            {
              "id": "cap_flooring__floor_preparation",
              "label": "Floor Preparation"
            }
          ]
        },
        {
          "id": "trade_millwork",
          "label": "Millwork",
          "capabilities": [
            {
              "id": "cap_millwork__cabinetry",
              "label": "Cabinetry"
            },
            {
              "id": "cap_millwork__architectural_millwork",
              "label": "Architectural Millwork"
            },
            {
              "id": "cap_millwork__installation",
              "label": "Installation"
            }
          ]
        },
        {
          "id": "trade_other_finishes",
          "label": "Other Finishes",
          "capabilities": [
            {
              "id": "cap_other_finishes__describe_your_specialty",
              "label": "Describe Your Specialty"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_general_labor_and_support",
      "label": "General Labor & Support",
      "trades": [
        {
          "id": "trade_general_labor",
          "label": "General Labor",
          "capabilities": [
            {
              "id": "cap_general_labor__labor_crews",
              "label": "Labor Crews"
            },
            {
              "id": "cap_general_labor__material_handling",
              "label": "Material Handling"
            },
            {
              "id": "cap_general_labor__site_support",
              "label": "Site Support"
            }
          ]
        },
        {
          "id": "trade_construction_cleanup",
          "label": "Construction Cleanup",
          "capabilities": [
            {
              "id": "cap_construction_cleanup__progress_cleaning",
              "label": "Progress Cleaning"
            },
            {
              "id": "cap_construction_cleanup__final_cleaning",
              "label": "Final Cleaning"
            },
            {
              "id": "cap_construction_cleanup__debris_removal",
              "label": "Debris Removal"
            }
          ]
        },
        {
          "id": "trade_other_support",
          "label": "Other Support",
          "capabilities": [
            {
              "id": "cap_other_support__describe_your_specialty",
              "label": "Describe Your Specialty"
            }
          ]
        }
      ]
    },
    {
      "id": "grp_other_specialty",
      "label": "Other / Specialty",
      "trades": [
        {
          "id": "trade_other_specialty_trade",
          "label": "Other Specialty Trade",
          "capabilities": [
            {
              "id": "cap_other_specialty_trade__describe_your_specialty",
              "label": "Describe Your Specialty"
            }
          ]
        }
      ]
    }
  ],
  "partnerTypes": [
    "trade",
    "design",
    "supplier",
    "equipment"
  ]
};
