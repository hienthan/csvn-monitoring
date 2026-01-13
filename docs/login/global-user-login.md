# Global User - Login

## Request

```sh
  curl --request POST \
    --url https://gmo021.cansportsvg.com/api/global-user/login \
    --header 'Content-Type: application/json' \
    --data '{
    "username": "048466",
    "password": "048466",
    "app": "ems"
  }'
```

## Response

- When correct credentials:

  ```json
  {
  "id": 1490,
  "username": "048466",
  "syno_channel_id": null,
  "syno_username": "hien.than",
  "syno_user_id": null,
  "name": "THÂN QUANG HIỂN",
  "email": "hien.than@spg-sportsgear.com",
  "extno": "172",
  "empno": "048466",
  "group_empno": null,
  "dept_hrm": null,
  "high_dept_": null,
  "dept_old": null,
  "high_dept": "TIT00302",
  "dept": "TIT00302",
  "isDeptManager": 0,
  "isDivisionManager": 0,
  "position": "local",
  "location": "vg",
  "locations": "[\"vg\"]",
  "factory_code": "[]",
  "language": "vi",
  "active": "1",
  "limit_role": "[]",
  "app_roles": "[{\"app\":\"camera\",\"role\":\"admin\"},{\"app\":\"vg-ras\",\"role\":\"admin\"},{\"app\":\"vg-visitor\",\"role\":\"admin\"},{\"app\":\"vg-pab\",\"role\":\"admin\"},{\"app\":\"vg-transport\",\"role\":\"admin\"},{\"app\":\"vg-er\",\"role\":\"admin\"},{\"app\":\"vg-elearning\",\"role\":\"admin\"},{\"app\":\"vg-deputy\",\"role\":\"admin\"},{\"app\":\"set-all-to-user-role\",\"role\":\"admin\"},{\"app\":\"aw-visitor\",\"role\":\"admin\"},{\"app\":\"vg-tcv\",\"role\":\"user\"},{\"app\":\"vg-ept\",\"role\":\"user\"},{\"app\":\"vg-rac\",\"role\":\"user\"},{\"app\":\"epm\",\"role\":\"user\"},{\"app\":\"wm\",\"role\":\"user\"},{\"app\":\"mcm\",\"role\":\"user\"},{\"app\":\"vg-di-rfid\",\"role\":\"user\"},{\"app\":\"vfa\",\"role\":\"user\"},{\"app\":\"sma\",\"role\":\"user\"},{\"app\":\"ssr-rfid\",\"role\":\"user\"},{\"app\":\"vg-pl\",\"role\":\"user\"},{\"app\":\"vg-ids\",\"role\":\"user\"},{\"app\":\"vg-avg\",\"role\":\"user\"},{\"app\":\"vg-bta\",\"role\":\"user\"},{\"app\":\"vg-bdm\",\"role\":\"user\"},{\"app\":\"recruiting-report\",\"role\":\"user\"},{\"app\":\"aw-recruiting-report\",\"role\":\"user\"},{\"app\":\"dma\",\"role\":\"user\"},{\"app\":\"demo\",\"role\":\"user\"},{\"app\":\"portal\",\"role\":\"user\"},{\"app\":\"llm\",\"role\":\"user\"},{\"app\":\"ma6\",\"role\":\"user\"},{\"app\":\"seal-mngt\",\"role\":\"user\"},{\"app\":\"SCP\",\"role\":\"user\"},{\"app\":\"vg-sm\",\"role\":\"user\"},{\"app\":\"rpa\",\"role\":\"user\"},{\"app\":\"mpr\",\"role\":\"user\"},{\"app\":\"vg-di-bdm\",\"role\":\"user\"},{\"app\":\"vg-sgid\",\"role\":\"user\"},{\"app\":\"lab-test-tracking-system\",\"role\":\"user\"},{\"app\":\"aw-transport\",\"role\":\"user\"},{\"app\":\"aw-camera\",\"role\":\"user\"},{\"app\":\"aw-transport-demo\",\"role\":\"user\"},{\"app\":\"cpl\",\"role\":\"user\"},{\"app\":\"aw_bta_demo\",\"role\":\"user\"},{\"app\":\"aw_rpa_demo\",\"role\":\"user\"},{\"app\":\"aw_dma_demo\",\"role\":\"user\"},{\"app\":\"hrm\",\"role\":\"user\"},{\"app\":\"qc-lab-claim\",\"role\":\"user\"},{\"app\":\"local-cctv\",\"role\":\"user\"},{\"app\":\"aw-sgid\",\"role\":\"user\"},{\"app\":\"aw-cm\",\"role\":\"user\"},{\"app\":\"aw-rpa\",\"role\":\"user\"},{\"app\":\"vg-ems\",\"role\":\"user\"},{\"app\":\"di-kpi\",\"role\":\"user\"}]",
  "app_access_counts": "[{\"app\":\"hrm\",\"count\":1},{\"app\":\"vg-pab\",\"count\":1},{\"app\":\"aw-camera\",\"count\":1}]",
  "favorites": null,
  "token_backup": null,
  "token": null,
  "code_change_pw": null,
  "bpm_account_id": null,
  "created_at": "2025-12-06 07:57:22",
  "updated_at": "2026-01-13 08:05:20",
  "session_token": "228d0a9a329db5924fb1161771ddbd61ce36340132387a0efae62bc65fdcbd50"
}

  ```

  ```

- When wrong:

  ```plaintext
   wrong
  ```
