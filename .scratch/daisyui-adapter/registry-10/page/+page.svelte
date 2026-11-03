<script lang="ts">
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset">
		<Sidebar.Header>
			<p class="px-2 py-1 text-sm font-semibold">Ticket 10 probe</p>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive>Active row</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton variant="outline" id="outline-row">Outline row</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>Idle row</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
			<Sidebar.Separator />
			<Sidebar.Group>
				<Sidebar.GroupLabel>Brand</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<div
						id="primary-pair"
						class="bg-sidebar-primary text-sidebar-primary-foreground mx-2 rounded-md px-3 py-2 text-sm"
					>
						primary pair
					</div>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
	<Sidebar.Inset>
		<div class="p-6 text-sm">content on --background</div>
	</Sidebar.Inset>
</Sidebar.Provider>
