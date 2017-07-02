
default: deploy

node_modules:
	@npm install

config.yml:
	@echo -e "---\nbucket:tds-slack\nslack_client_id:$(SLACK_CLIENT_ID)\nslack_verification_token:$(SLACK_VERIFICATION_TOKEN)\nslack_client_secret:$(SLACK_CLIENT_SECRET)\nmashape_api_key:$(MASHAPE_API_KEY)\n" > $@

.PHONY: dev
dev: node_modules config.yml
	@nohup sls dynamodb start > /dev/null 2>&1 &
	@sls offline start

.PHONY: deploy
deploy: node_modules config.yml
	@serverless deploy
