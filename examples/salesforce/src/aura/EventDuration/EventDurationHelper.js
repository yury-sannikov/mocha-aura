({
	buildTimezoneObj : function(component) {
		var action = component.get('c.getEventTimezones');
		var self = this;
		action.setCallback(this,function(response){
			component.set('durationObj', response.getReturnValue());
			self.refreshTimeFields(component, false);
		});
		$A.enqueueAction(action);
	},
  refreshTimeFields : function(component, overwriteAMPM) {
		var self = this;
    var startHour = parseInt(component.get('v.durationObj').startHour,10);
    var endHour = parseInt(component.get('v.durationObj').endHour,10);
    component.set('v.result', endHour - startHour);
  }
})
